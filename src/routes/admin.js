const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

// @route   GET /api/admin/posts/pending
// @desc    获取所有待审核游记
// @access  Private (admin only)
router.get('/posts/pending', auth, adminController.getPendingPosts);

// @route   PUT /api/admin/posts/:id/approve
// @desc    批准游记
// @access  Private (admin only)
router.put('/posts/:id/approve', auth, adminController.approvePost);

// @route   PUT /api/admin/posts/:id/reject
// @desc    拒绝游记
// @access  Private (admin only)
router.put('/posts/:id/reject', auth, adminController.rejectPost);

// @route   GET /api/admin/users
// @desc    获取所有用户
// @access  Private (admin only)
router.get('/users', auth, adminController.getUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    更新用户角色
// @access  Private (admin only)
router.put('/users/:id/role', auth, adminController.updateUserRole);

module.exports = router; 