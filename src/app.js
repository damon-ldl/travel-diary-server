const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('../config');
const { swaggerSpec, swaggerUi } = require('./swagger');

// 初始化Express应用
const app = express();

// 中间件
app.use(express.json());

// 配置CORS
app.use((req, res, next) => {
  // 允许所有来源访问
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin);
  
  // 允许携带凭证
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 允许的请求方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  
  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 预检请求缓存时间
  res.header('Access-Control-Max-Age', '86400');
  
  // 额外的响应头
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// 连接到MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
  });

// 导入路由
const authRoutes = require('./routes/auth');
const diariesRoutes = require('./routes/diaries');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/diaries', diariesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 添加Swagger文档路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 设置静态文件夹
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/media', express.static(path.join(__dirname, '../uploads/media')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// 定义API服务器状态检查路由
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: '旅游日记API服务器运行正常' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: '服务器内部错误', message: err.message });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API文档地址: http://localhost:${PORT}/api-docs`);
  console.log(`静态文件访问示例: http://localhost:${PORT}/uploads/sample/beijing1.jpg`);
});

module.exports = app; 