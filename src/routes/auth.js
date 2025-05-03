const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const upload = require('../utils/fileUpload');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - nickname
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名，需唯一
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码
 *               nickname:
 *                 type: string
 *                 description: 用户昵称，需唯一
 *               avatar:
 *                 type: string
 *                 description: 用户头像文件
 *     responses:
 *       200:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 用户ID
 *                 username:
 *                   type: string
 *                   description: 用户名
 *                 nickname:
 *                   type: string
 *                   description: 用户昵称
 *                 avatarUrl:
 *                   type: string
 *                   description: 头像URL
 *       400:
 *         description: 请求错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 错误信息
 */
router.post('/register', upload.single('avatar'), authController.register);

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
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 用户ID
 *                 username:
 *                   type: string
 *                   description: 用户名
 *                 nickname:
 *                   type: string
 *                   description: 用户昵称
 *                 avatarUrl:
 *                   type: string
 *                   description: 头像URL
 *                 token:
 *                   type: string
 *                   description: 认证令牌
 *       400:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 错误信息
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/me:
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
 *                 nickname:
 *                   type: string
 *                   description: 用户昵称
 *                 avatarUrl:
 *                   type: string
 *                   description: 头像URL
 *                 role:
 *                   type: string
 *                   description: 用户角色
 *       401:
 *         description: 未授权，token无效
 */
router.get('/me', auth, authController.getCurrentUser);

module.exports = router; 