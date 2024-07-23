const jwt = require('jsonwebtoken'); //  used to create, sign, and verify JSON Web Tokens (JWTs) for authentication
const config = require('config'); // used to create global values in a central file (default.js) to be used in your app

// exporting a custom middleware function used to verify the token
module.exports = function (req, res, next) {
  // get token from header
  const token = req.header('x-auth-token');

  // check if no token is provided in headers
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // verify token
  try {
    // decode the token using the secret key
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    // assign the decoded user information to the request object
    req.user = decoded.user;

    // proceed to the next middleware or route handler
    next();
  } catch (err) {
    // if token verification fails, respond with a 401 status and error message
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
