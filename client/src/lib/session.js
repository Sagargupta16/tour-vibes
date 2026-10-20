// The session lives in localStorage, which every app on the origin shares (the
// Pages demo sits beside other apps on sagargupta.online), so its keys carry a
// prefix: another app's bare `token` must never sign anyone in or out here.
const PREFIX = 'tour-vibes:';

export const SESSION_KEYS = ['token', 'expiryDate', 'userId', 'name', 'avatar'].map(
   (key) => `${PREFIX}${key}`
);

export const getStored = (key) => localStorage.getItem(`${PREFIX}${key}`);
export const setStored = (key, value) => localStorage.setItem(`${PREFIX}${key}`, value);
export const removeStored = (key) => localStorage.removeItem(`${PREFIX}${key}`);
export const clearStored = () => SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
