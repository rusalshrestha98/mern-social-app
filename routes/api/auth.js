// import packages
const express = require('express'); // used to create and manage web servers and APIs in Node.js
const bcrypt = require('bcryptjs'); // used for hashing passwords
const jwt = require('jsonwebtoken'); // used to create, sign, and verify JSON Web Tokens (JWTs) for authentication
const config = require('config'); // used to create global values in a central file (default.js) to be used in your app
const { check, validationResult } = require('express-validator'); // middleware for validating requests

// import custom middleware
const auth = require('../../middleware/auth');

// import models
const User = require('../../models/User');

// create a new instance of an express router
const router = express.Router();

// @route   GET api/auth
// @desc    Get a user by ID
// @access  Public
router.get(
  // path: a string or a regular expression that specifies the route path
  '/',
  // middleware: (optional) middleware function(s) that process the request before reaching the final route handler
  // auth middleware makes this a protected route (basically requires a valid token to work)
  auth,
  // callback: the route handler function that contains the logic to be executed when the route is matched
  async (req, res) => {
    try {
      // because we assigned req.user = decoded.user in the auth middleware, we can access the ID here like this
      // excluding password because we don't need it
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth
// @desc    Authenticate user & get token so that you can access private routes
// @access  Public
router.post(
  // path: a string or a regular expression that specifies the route path
  '/',
  // middleware: (optional) middleware function(s) that process the request before reaching the final route handler
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  // callback: the route handler function that contains the logic to be executed when the route is matched
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // check if user exists
      let user = await User.findOne({ email: email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // check if password is correct
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // return json web token
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token }); // paste this token into jwt.io to see the user.id payload
      });
    } catch (err) {
      console.log('Error', err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
