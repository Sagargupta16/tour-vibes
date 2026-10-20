// Password hashes and session tokens for the demo API. Not real security, since
// the whole database sits in this browser anyway: the token only has to look,
// expire (1 hour) and fail like the server's JWT. Every reseed draws a new
// secret, so a reset of the demo data ends every old session with a 401.
import { hex, httpError } from './util';

const encoder = new TextEncoder();
const HOUR_S = 60 * 60;

const sha256 = async (value) =>
   hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));

const toBase64Url = (value) =>
   btoa(String.fromCodePoint(...encoder.encode(value)))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '');

const fromBase64Url = (part) =>
   new TextDecoder().decode(
      Uint8Array.from(atob(part.replaceAll('-', '+').replaceAll('_', '/')), (c) => c.codePointAt(0))
   );

const sign = (data, secret) => sha256(`${data}.${secret}`);

export const hashPassword = (password, salt) => sha256(`${salt}:${password}`);

export async function signToken(user, secret, now) {
   const iat = Math.floor(now / 1000);
   const head = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
   const body = toBase64Url(
      JSON.stringify({ email: user.email, userId: user._id, iat, exp: iat + HOUR_S })
   );
   const data = `${head}.${body}`;
   return `${data}.${await sign(data, secret)}`;
}

// The jsonwebtoken errors the server's is-auth middleware answers with a 401
export async function verifyToken(token, secret, now) {
   const parts = token.split('.');
   if (parts.length !== 3) throw httpError(401, 'jwt malformed');
   const [head, body, signature] = parts;
   if (signature !== (await sign(`${head}.${body}`, secret))) {
      throw httpError(401, 'invalid signature');
   }
   let payload;
   try {
      payload = JSON.parse(fromBase64Url(body));
   } catch {
      throw httpError(401, 'jwt malformed');
   }
   // A missing or non-numeric exp gives NaN and counts as expired
   const expiresAt = payload.exp * 1000;
   if (Number.isNaN(expiresAt) || expiresAt <= now) throw httpError(401, 'jwt expired');
   return payload.userId;
}
