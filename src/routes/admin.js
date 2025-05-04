const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /api/admin/diaries:
 *   get:
 *     summary: 获取待审核游记列表（管理员）
 *     tags: [管理员]
 */
router.get('/diaries', adminController.getDiaries);

/**
 * @swagger
 * /api/admin/diaries/{id}/approve:
 *   put:
 *     summary: 审核通过游记（管理员）
 *     tags: [管理员]
 */
router.put('/diaries/:id/approve', adminController.approveDiary);

/**
 * @swagger
 * /api/admin/diaries/{id}/reject:
 *   put:
 *     summary: 审核拒绝游记（管理员）
 *     tags: [管理员]
 */
router.put('/diaries/:id/reject', adminController.rejectDiary);

/**
 * @swagger
 * /api/admin/diaries/{id}:
 *   delete:
 *     summary: 逻辑删除游记（管理员）
 *     tags: [管理员]
 */
router.delete('/diaries/:id', adminController.deleteDiary);

// @route   GET /api/admin/users
// @desc    获取所有用户
// @access  Public
router.get('/users', adminController.getUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    更新用户角色
// @access  Public
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router; 