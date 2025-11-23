const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts with user details
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email isAdmin')
      .populate('comments.userId', 'username isAdmin');

    const total = await Post.countDocuments();

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username email isAdmin')
      .populate('comments.userId', 'username isAdmin');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', [
  authMiddleware,
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Content must be 1-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, image } = req.body;

    const post = new Post({
      userId: req.userId,
      content,
      image: image || null
    });

    await post.save();

    // Populate user details
    await post.populate('userId', 'username email isAdmin');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', [
  authMiddleware,
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Content must be 1-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const { content, image } = req.body;
    post.content = content;
    if (image !== undefined) {
      post.image = image;
    }

    await post.save();
    await post.populate('userId', 'username email isAdmin');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (Owner or Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post or is admin
    const isOwner = post.userId.toString() === req.userId;
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      await post.save();
      await post.populate('userId', 'username email isAdmin');
      
      res.json({
        message: 'Post unliked',
        post,
        liked: false
      });
    } else {
      // Like
      post.likes.push(req.userId);
      await post.save();
      await post.populate('userId', 'username email isAdmin');
      
      res.json({
        message: 'Post liked',
        post,
        liked: true
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', [
  authMiddleware,
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      userId: req.userId,
      text: req.body.text
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('userId', 'username email isAdmin');
    await post.populate('comments.userId', 'username isAdmin');

    res.status(201).json({
      message: 'Comment added successfully',
      post
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// @route   DELETE /api/posts/:id/comment/:commentId
// @desc    Delete a comment from a post
// @access  Private (Comment Owner or Admin)
router.delete('/:id/comment/:commentId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    const isOwner = comment.userId.toString() === req.userId;
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();
    await post.populate('userId', 'username email isAdmin');
    await post.populate('comments.userId', 'username isAdmin');

    res.json({
      message: 'Comment deleted successfully',
      post
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user ID
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username email isAdmin')
      .populate('comments.userId', 'username isAdmin')
      .populate('likes', 'username');

    res.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

module.exports = router;
