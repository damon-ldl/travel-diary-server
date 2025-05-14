const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = async (req, res, next) => {
  try {
    // 获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // 如果没有token，继续处理请求，但不设置req.user
      return next();
    }

    try {
      // 验证token
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
    } catch (err) {
      // token验证失败，继续处理请求，但不设置req.user
      console.warn('Token验证失败:', err.message);
    }
    
    next();
  } catch (err) {
    console.error('可选认证中间件错误:', err.message);
    next();
  }
}; 