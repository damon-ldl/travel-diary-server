const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

// 导入模型
const User = require('../src/models/User');
const Post = require('../src/models/Post');

// 连接到MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
  .then(() => console.log('MongoDB连接成功，开始初始化数据...'))
  .catch(err => {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
  });

// 清空现有数据
const clearData = async () => {
  try {
    await User.deleteMany({});
    console.log('用户数据已清空');
    
    await Post.deleteMany({});
    console.log('游记数据已清空');
  } catch (err) {
    console.error('清空数据失败:', err);
    process.exit(1);
  }
};

// 创建初始管理员账户
const createAdmin = async () => {
  try {
    // 生成密码盐值
    const salt = await bcrypt.genSalt(10);
    
    // 加密密码
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // 创建管理员用户
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    console.log('管理员账户创建成功');
    return admin;
  } catch (err) {
    console.error('创建管理员失败:', err);
    process.exit(1);
  }
};

// 创建示例用户
const createUsers = async () => {
  try {
    // 生成密码盐值
    const salt = await bcrypt.genSalt(10);
    
    // 创建普通用户
    const user1 = new User({
      username: 'user1',
      email: 'user1@example.com',
      password: await bcrypt.hash('user123', salt),
      role: 'user'
    });
    
    const user2 = new User({
      username: 'user2',
      email: 'user2@example.com',
      password: await bcrypt.hash('user123', salt),
      role: 'user'
    });
    
    await user1.save();
    await user2.save();
    
    console.log('示例用户创建成功');
    return [user1, user2];
  } catch (err) {
    console.error('创建用户失败:', err);
    process.exit(1);
  }
};

// 创建示例游记
const createSamplePosts = async (users) => {
  try {
    // 为user1创建一个已批准的游记
    const post1 = new Post({
      title: '北京之旅',
      content: '这是一次难忘的北京旅行，参观了长城、故宫和天坛等著名景点。',
      location: '北京',
      tags: ['历史', '文化', '美食'],
      images: ['/uploads/sample-beijing1.jpg', '/uploads/sample-beijing2.jpg'],
      videos: [],
      author: users[0]._id,
      status: 'approved'
    });
    
    // 为user2创建一个待审核的游记
    const post2 = new Post({
      title: '上海之行',
      content: '上海是一个现代化的大都市，外滩的夜景非常美丽。',
      location: '上海',
      tags: ['现代', '都市', '夜景'],
      images: ['/uploads/sample-shanghai.jpg'],
      videos: [],
      author: users[1]._id,
      status: 'pending'
    });
    
    await post1.save();
    await post2.save();
    
    console.log('示例游记创建成功');
  } catch (err) {
    console.error('创建游记失败:', err);
    process.exit(1);
  }
};

// 初始化示例图片
const createSampleUploads = async () => {
  console.log('注意: 在真实环境中，您需要手动将示例图片放入uploads目录');
  console.log('在此示例数据中引用的图片路径仅作演示用途');
};

// 执行初始化
const init = async () => {
  try {
    await clearData();
    const admin = await createAdmin();
    const users = await createUsers();
    await createSamplePosts([...users, admin]);
    await createSampleUploads();
    
    console.log('数据库初始化完成');
    process.exit(0);
  } catch (err) {
    console.error('初始化失败:', err);
    process.exit(1);
  }
};

// 启动初始化流程
init(); 