const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middlewares/auth');

// @route   POST /api/posts
// @desc    创建新游记
// @access  Private
router.post('/', auth, postController.createPost);

// @route   GET /api/posts
// @desc    获取所有已批准的游记
// @access  Public
router.get('/', postController.getPosts);

// @route   GET /api/posts/:id
// @desc    获取特定游记
// @access  Private
router.get('/:id', auth, postController.getPostById);

// @route   GET /api/posts/user/me
// @desc    获取用户的所有游记
// @access  Private
router.get('/user/me', auth, postController.getUserPosts);

// @route   PUT /api/posts/:id
// @desc    更新游记
// @access  Private
router.put('/:id', auth, postController.updatePost);

// @route   DELETE /api/posts/:id
// @desc    删除游记
// @access  Private
router.delete('/:id', auth, postController.deletePost);

// @route   GET /api/posts/search
// @desc    搜索游记
// @access  Public
router.get('/search', postController.searchPosts);

module.exports = router; 