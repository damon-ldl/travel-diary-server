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
 *     security:
 *       - bearerAuth: []
 */
router.get('/diaries', auth, adminController.getDiaries);

/**
 * @swagger
 * /api/admin/diaries/{id}/approve:
 *   put:
 *     summary: 审核通过游记（管理员）
 *     tags: [管理员]
 *     security:
 *       - bearerAuth: []
 */
router.put('/diaries/:id/approve', auth, adminController.approveDiary);

/**
 * @swagger
 * /api/admin/diaries/{id}/reject:
 *   put:
 *     summary: 审核拒绝游记（管理员）
 *     tags: [管理员]
 *     security:
 *       - bearerAuth: []
 */
router.put('/diaries/:id/reject', auth, adminController.rejectDiary);

/**
 * @swagger
 * /api/admin/diaries/{id}:
 *   delete:
 *     summary: 逻辑删除游记（管理员）
 *     tags: [管理员]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/diaries/:id', auth, adminController.deleteDiary);

// @route   GET /api/admin/users
// @desc    获取所有用户
// @access  Private (admin only)
router.get('/users', auth, adminController.getUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    更新用户角色
// @access  Private (admin only)
router.put('/users/:id/role', auth, adminController.updateUserRole);

module.exports = router; 