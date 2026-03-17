const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
   const authHeader = req.get('Authorization');
   if (!authHeader) {
      const err = new Error('Not Authenticated');
      err.statusCode = 401;
      throw err;
   }
   const parts = authHeader.split(' ');
   if (parts.length !== 2 || parts[0] !== 'Bearer') {
      const err = new Error('Invalid Authorization header format');
      err.statusCode = 401;
      throw err;
   }
   const token = parts[1];
   let decodedToken;
   try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
   } catch (err) {
      err.statusCode = 401;
      throw err;
   }
   if (!decodedToken) {
      const err = new Error('Not Authenticated');
      err.statusCode = 401;
      throw err;
   }
   req.userId = decodedToken.userId;
   next();
};
