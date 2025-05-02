const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 注册新用户
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 注册成功，返回JWT令牌
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT令牌
 *       400:
 *         description: 请求错误，如邮箱已注册或用户名已使用
 *       500:
 *         description: 服务器错误
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 登录成功，返回JWT令牌
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT令牌
 *       400:
 *         description: 登录失败，如用户不存在或密码错误
 *       500:
 *         description: 服务器错误
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: 用户ID
 *                 username:
 *                   type: string
 *                   description: 用户名
 *                 email:
 *                   type: string
 *                   description: 邮箱地址
 *                 avatar:
 *                   type: string
 *                   description: 头像地址
 *                 role:
 *                   type: string
 *                   description: 用户角色
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: 创建时间
 *       401:
 *         description: 未授权，token无效或已过期
 *       500:
 *         description: 服务器错误
 */
router.get('/user', auth, authController.getCurrentUser);

module.exports = router; 