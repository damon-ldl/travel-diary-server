const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const User = require('./src/models/User');

// 设置管理员信息
const adminUser = {
  username: 'admin',
  password: 'admin123',  // 您可以修改为更安全的密码
  nickname: '管理员',
  role: 'admin'
};

// 连接数据库
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(async () => {
  console.log('MongoDB连接成功');
  
  try {
    // 检查管理员是否已存在
    const existingAdmin = await User.findOne({ username: adminUser.username });
    
    if (existingAdmin) {
      console.log('管理员账号已存在，无需创建');
      mongoose.disconnect();
      return;
    }
    
    // 创建新管理员
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    const newAdmin = new User({
      username: adminUser.username,
      password: hashedPassword,
      nickname: adminUser.nickname,
      role: adminUser.role
    });
    
    await newAdmin.save();
    console.log('管理员账号创建成功！');
    console.log(`用户名: ${adminUser.username}`);
    console.log(`密码: ${adminUser.password}`);
  } catch (err) {
    console.error('创建管理员账号失败:', err);
  } finally {
    mongoose.disconnect();
  }
})
.catch(err => {
  console.error('MongoDB连接失败:', err);
});