// import packages
const express = require('express');

// import custom middleware
const auth = require('../../middleware/auth');

// import models
const User = require('../../models/User');

const router = express.Router();

// @route   GET api/auth
// @desc    Test route
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

module.exports = router;
