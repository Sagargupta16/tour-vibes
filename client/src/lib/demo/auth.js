// /auth routes, mirroring server/controllers/auth.js and the validation chains
// in server/routes/auth.js (messages, status codes and sanitizers).
import { findById, ownProfile } from './db';
import { hashPassword, signToken } from './session';
import { httpError, isEmail, iso, objectId, pick, randomHex, text, validator } from './util';

const AVATAR_SIZE = 512;

// normalizeEmail({ gmail_remove_dots: false }) lowercases the address
const normalizeEmail = (value) => text(value).trim().toLowerCase();

const findUser = (db, id) => {
   const user = findById(db.users, id);
   if (!user) throw httpError(404, 'User not found');
   return user;
};

const passwordMatches = async (user, password) =>
   Boolean(user?.password) && (await hashPassword(password, user.salt)) === user.password;

const session = async ({ db, now }, user) => ({
   status: 200,
   body: { token: await signToken(user, db.secret, now), name: user.name, userId: user._id }
});

export async function signup({ db, body, now }) {
   const v = validator(body);
   v.check('email', isEmail(text(body.email)), 'Enter a valid email');
   // Normalized before the duplicate check, as on the server
   const email = normalizeEmail(body.email);
   body.email = email;
   v.check('email', !db.users.some((u) => u.email === email), 'Email already registered');
   body.password = text(body.password).trim();
   v.check('password', body.password.length >= 8, 'Password must be at least 8 characters');
   body.name = text(body.name).trim();
   v.check('name', body.name !== '', 'Name is required');
   v.check('name', body.name.length <= 80, 'Name cannot exceed 80 characters');
   v.done();

   const salt = randomHex(16);
   const at = iso(now);
   const user = {
      _id: objectId(now),
      email,
      name: body.name,
      password: await hashPassword(body.password, salt),
      salt,
      bio: '',
      avatar: '',
      location: '',
      status: 'I am new',
      posts: [],
      createdAt: at,
      updatedAt: at,
      __v: 0
   };
   db.users.push(user);
   return { status: 201, body: { message: 'User successfully registered', userId: user._id } };
}

export async function login(ctx) {
   const { db, body } = ctx;
   const v = validator(body);
   v.check('email', isEmail(text(body.email)), 'Enter a valid email');
   body.password = text(body.password).trim();
   v.check('password', body.password !== '', 'Password is required');
   v.done();
   const user = db.users.find((u) => u.email === normalizeEmail(body.email));
   // One message for both cases, as on the server
   if (!(await passwordMatches(user, body.password))) {
      throw httpError(401, 'Invalid email or password');
   }
   return session(ctx, user);
}

// One-click sign in as the seeded demo user, like POST /auth/demo with DEMO_EMAIL set
export function demoLogin(ctx) {
   const user = findById(ctx.db.users, ctx.db.demoUserId);
   if (!user) throw httpError(404, 'Demo login is not available');
   return session(ctx, user);
}

export function getProfile({ db, userId }) {
   return { status: 200, body: { user: ownProfile(findUser(db, userId)) } };
}

export async function updateProfile({ db, body, file, userId, now, images }) {
   const v = validator(body);
   if (body.name !== undefined) {
      body.name = text(body.name).trim();
      v.check('name', body.name !== '', 'Name cannot be empty');
      v.check('name', body.name.length <= 80, 'Name cannot exceed 80 characters');
   }
   if (body.bio !== undefined) {
      v.check('bio', typeof body.bio === 'string', 'Bio must be text');
      v.check('bio', text(body.bio).length <= 300, 'Bio cannot exceed 300 characters');
   }
   for (const key of ['location', 'status']) {
      if (body[key] === undefined) continue;
      body[key] = text(body[key]).trim();
      v.check(key, body[key].length <= 100, 'Location and status cannot exceed 100 characters');
   }
   v.done();

   const user = findUser(db, userId);
   for (const key of ['name', 'bio', 'location', 'status']) {
      if (body[key] !== undefined) user[key] = body[key];
   }
   if (file) {
      const avatar = await images.save(file, AVATAR_SIZE);
      await images.remove(user.avatar);
      user.avatar = avatar;
   }
   user.updatedAt = iso(now);
   return { status: 200, body: { message: 'Profile updated', user: ownProfile(user) } };
}

export async function changePassword({ db, body, userId, now }) {
   const v = validator(body);
   body.currentPassword = text(body.currentPassword).trim();
   v.check('currentPassword', body.currentPassword !== '', 'Current password is required');
   body.newPassword = text(body.newPassword).trim();
   v.check(
      'newPassword',
      body.newPassword.length >= 8,
      'New password must be at least 8 characters'
   );
   v.done();
   const user = findUser(db, userId);
   // 422, not 401: the session is valid, and the client treats a 401 as expired
   if (!(await passwordMatches(user, body.currentPassword))) {
      throw httpError(422, 'Current password is incorrect');
   }
   user.salt = randomHex(16);
   user.password = await hashPassword(body.newPassword, user.salt);
   user.updatedAt = iso(now);
   return { status: 200, body: { message: 'Password changed successfully' } };
}

// Public fields only: no email, no password
export function getPublicProfile({ db, params }) {
   const user = findUser(db, params.userId);
   const fields = ['_id', 'name', 'bio', 'avatar', 'location', 'status', 'createdAt'];
   return { status: 200, body: { user: pick(user, fields) } };
}
