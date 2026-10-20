// Client copies of the server's express-validator rules (server/routes/auth.js), so a
// field shows its error before the request goes out. The server stays the authority.

export const PASSWORD_MIN = 8;
export const NAME_MAX = 80;
export const BIO_MAX = 300;
// Location and status
export const SHORT_MAX = 100;

export function required(value) {
   return String(value ?? '').trim().length > 0;
}

export function length({ min, max }) {
   return (value) => {
      const len = String(value ?? '').trim().length;
      if (min && len < min) return false;
      if (max && len > max) return false;
      return true;
   };
}

// One @, no whitespace, and a dotted domain ending in a 2+ letter TLD: close to the
// server's isEmail() without a backtracking regex
export function email(value) {
   const v = String(value ?? '').trim();
   if (/\s/.test(v)) return false;
   const parts = v.split('@');
   if (parts.length !== 2) return false;
   const [local, domain] = parts;
   if (!local || local.length > 64 || domain.length > 253) return false;
   const labels = domain.split('.');
   return labels.length >= 2 && labels.every(Boolean) && labels.at(-1).length >= 2;
}

// Each rule returns an error message, or '' when the value passes
export const rules = {
   name: (v) => {
      if (!required(v)) return 'Name is required';
      return String(v).trim().length <= NAME_MAX ? '' : `Name cannot exceed ${NAME_MAX} characters`;
   },
   email: (v) => {
      if (!required(v)) return 'Email is required';
      return email(v) ? '' : 'Enter a valid email';
   },
   password: (v) =>
      String(v ?? '').trim().length >= PASSWORD_MIN
         ? ''
         : `Password must be at least ${PASSWORD_MIN} characters`,
   loginPassword: (v) => (required(v) ? '' : 'Password is required'),
   bio: (v) => (String(v ?? '').length <= BIO_MAX ? '' : `Bio cannot exceed ${BIO_MAX} characters`)
};

// Runs every rule over its field and returns { field: message } for the failures
export function validate(values, ruleMap) {
   const errors = {};
   for (const [key, rule] of Object.entries(ruleMap)) {
      const message = rule(values[key], values);
      if (message) errors[key] = message;
   }
   return errors;
}

// A 422 from express-validator carries data: [{ path, msg }]; map it onto form fields
export function serverFieldErrors(err) {
   const errors = {};
   for (const item of Array.isArray(err?.data) ? err.data : []) {
      const key = item.path ?? item.param;
      if (key && !errors[key]) errors[key] = item.msg;
   }
   return errors;
}

// 0 = under the minimum, then one point each for length, mixed case, digits plus symbols
export function passwordStrength(value) {
   const v = String(value ?? '');
   if (v.trim().length < PASSWORD_MIN) return 0;
   let score = 1;
   if (v.length >= 12) score += 1;
   if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
   if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score += 1;
   return score;
}
