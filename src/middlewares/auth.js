const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = function(req, res, next) {
  // 获取token
  const token = req.header('x-auth-token');

  // 检查是否存在token
  if(!token) {
    return res.status(401).json({ msg: '没有提供令牌，授权失败' });
  }

  // 验证token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded.user;
    next();
  } catch(err) {
    res.status(401).json({ msg: '令牌无效' });
  }
}; 