// import packages
const express = require('express'); // used to create and manage web servers and APIs in Node.js
const { check, validationResult } = require('express-validator'); // middleware for validating requests
const gravatar = require('gravatar'); // used to generate URLs based on email addresses for displaying user avatars
const bcrypt = require('bcryptjs'); // used for hashing passwords
const jwt = require('jsonwebtoken'); // used to create, sign, and verify JSON Web Tokens (JWTs) for authentication
const config = require('config'); // used to create global values in a central file (default.js) to be used in your app

// import models
const User = require('../../models/User');

// create a new instance of an express router
const router = express.Router();

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  // path: a string or a regular expression that specifies the route path
  '/',
  // middleware: (optional) middleware function(s) that process the request before reaching the final route handler
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  // callback: the route handler function that contains the logic to be executed when the route is matched
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // see if user exists already
      let user = await User.findOne({ email: email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      // get users gravatar
      const gravatarURL = gravatar.url(email, {
        s: '200', // size
        r: 'pg', // rating
        d: 'mm', // default image if user does not have avatar
      });

      // create an instance of the user
      user = new User({
        name,
        email,
        gravatarURL,
        password,
      });

      // encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // save the user into mongodb collection
      await user.save();

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
