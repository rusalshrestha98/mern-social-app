// Import packages
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import middleware
const auth = require('../../middleware/auth');

// Import models
const Posts = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth, [check('text', 'Text is required').not().isEmpty()]], async (req, res) => {
  // Check if request body does not pass validation rules
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Get the user that is creating the post
    const user = await User.findById(req.user.id).select('-password');

    // Build the post object to insert into the database
    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    });

    // Save the new post in the database
    const post = await newPost.save();

    // Return the saved post in the response
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get all posts in most recent order
    const posts = await Post.find().sort({ date: -1 });

    // Return all the posts in the response
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Get a single post by id
    const post = await Post.findById(req.params.id);

    // If the post doesn't exist, return an error
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Return the single post in the response
    res.json(post);
  } catch (error) {
    console.error(error.message);

    // If the post id from the path is not a formated object id, return an error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete post by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Get a single post by id
    const post = await Post.findById(req.params.id);

    // If the post doesn't exist, return an error
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If the ID of the user who created the post and the logged-in user's ID don't match, return an error
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete the post
    await post.deleteOne();

    // Return a success message that the post was removed
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error.message);

    // If the post id from the path is not a formated object id, return an error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    // Get the post by ID
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by the user (so they can't like a post infinitely)
    if (post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    // If the user hasn't already liked it, add it to the start of the likes array
    post.likes.unshift({ user: req.user.id });

    // Save the post
    await post.save();

    // Send response back of all post likes
    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    // Get the post by ID
    const post = await Post.findById(req.params.id);

    // Check if the post has not yet been liked by the user (so they can't unlike a post they never liked)
    if (post.likes.filter((like) => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ message: 'Post has not yet been liked' });
    }

    // Get the index of the like to remove from the post
    const removeIndex = post.likes.map((like) => like.user.toString()).indexOf(req.user.id);

    // Remove the like from the post
    post.likes.splice(removeIndex, 1);

    // Save the post
    await post.save();

    // Send response back of all post likes
    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
