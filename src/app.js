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
// 配置CORS，允许特定域名访问API
app.use(cors({
  origin: [
    'http://localhost:10086',
    'http://localhost:3000',
    'http://169.254.236.213:10086', // 添加移动端开发服务器域名
    'http://10.99.128.5:10086', // 添加当前开发服务器域名
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // 允许携带凭证
}));

// 预检请求响应
app.options('*', cors());

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

// 定义API服务器状态检查路由
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: '旅游日记API服务器运行正常' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: '服务器内部错误', message: err.message });
});

module.exports = app; 