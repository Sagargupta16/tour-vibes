const isAuth = require('./is-auth');

// For public read routes. No Authorization header: carry on anonymously, req.userId
// stays undefined. Any header at all goes through isAuth, so a valid token sets
// req.userId and a stale or garbage one is still a 401 (the client logs out on it).
module.exports = (req, res, next) => {
   if (!req.get('Authorization')) return next();
   return isAuth(req, res, next);
};
