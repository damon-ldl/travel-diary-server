const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = function(req, res, next) {
  // 尝试从多个位置获取token
  // 1. 从x-auth-token头获取
  // 2. 从Authorization头获取 (Bearer Token)
  // 3. 从查询参数token获取
  // 4. 从body的token字段获取
  let token = 
    req.header('x-auth-token') || 
    (req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null) ||
    req.query.token || 
    (req.body ? req.body.token : null);

  // 检查是否存在token
  if (!token) {
    console.log('认证失败: 未提供令牌');
    return res.status(401).json({ msg: '没有提供令牌，授权失败' });
  }

  // 验证token
  try {
    console.log('尝试验证令牌:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded.user;
    next();
  } catch(err) {
    console.error('令牌验证失败:', err.message);
    res.status(401).json({ msg: '令牌无效' });
  }
}; 