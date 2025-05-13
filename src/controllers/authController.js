const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const User = require('../models/User');
const { getFullUrl } = require('../utils/urlHelper');

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
 *               password:
 *                 type: string
 *               nickname:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: 注册成功
 */
exports.register = async (req, res) => {
  try {
    console.log('注册请求信息:', {
      body: req.body,
      file: req.file,
      headers: req.headers
    });
    
    const { username, password, nickname } = req.body;
    
    // 检查用户是否已存在
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: '用户名已被使用' });
    }

    user = await User.findOne({ nickname });
    if (user) {
      return res.status(400).json({ error: '昵称已被占用' });
    }
    
    // 处理头像文件
    let avatarUrl = '/uploads/media/default/avatar-default.jpg';
    if (req.file) {
      avatarUrl = `/uploads/media/avatars/${req.file.filename}`;
    }

    // 创建新用户
    user = new User({
      username,
      nickname,
      password,
      avatarUrl
    });

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // 按规范返回用户信息
    res.json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatarUrl: getFullUrl(user.avatarUrl)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功，返回token
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpire },
      (err, token) => {
        if (err) throw err;
        res.json({
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatarUrl: getFullUrl(user.avatarUrl),
          role: user.role,
          token
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

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
 *         description: 成功获取用户信息
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatarUrl: getFullUrl(user.avatarUrl),
      role: user.role
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '服务器错误' });
  }
}; 