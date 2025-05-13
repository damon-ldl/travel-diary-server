const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

// 导入模型
const User = require('../src/models/User');
const Diary = require('../src/models/Post');  // 实际模型名称是Diary

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
    
    await Diary.deleteMany({});
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
      nickname: 'Administrator',
      password: hashedPassword,
      role: 'admin',
      avatarUrl: '/uploads/media/default/avatar-default.jpg'
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
      nickname: 'User One',
      password: await bcrypt.hash('user123', salt),
      role: 'user',
      avatarUrl: '/uploads/media/avatars/user1-avatar.jpg'
    });
    
    const user2 = new User({
      username: 'user2',
      nickname: 'User Two',
      password: await bcrypt.hash('user123', salt),
      role: 'user',
      avatarUrl: '/uploads/media/avatars/user2-avatar.jpg'
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
    const post1 = new Diary({
      title: '北京之旅',
      content: '这是一次难忘的北京旅行，参观了长城、故宫和天坛等著名景点。长城是世界七大奇迹之一，它不仅是一项伟大的工程，更是中华民族不屈不挠精神的象征。故宫作为明清两代的皇家宫殿，它的建筑之美让人叹为观止。天坛则展现了古代中国精湛的建筑技艺和深邃的哲学思想。',
      images: ['/uploads/media/images/beijing1.jpg', '/uploads/media/images/beijing2.jpg'],
      videoUrl: null,
      author: users[0]._id,
      status: 'approved'
    });
    
    // 为user2创建一个待审核的游记
    const post2 = new Diary({
      title: '上海之行',
      content: '上海是一个现代化的大都市，外滩的夜景非常美丽。站在浦东新区，望着黄浦江对岸林立的万国建筑群，灯光璀璨，美轮美奂。东方明珠、环球金融中心等现代建筑与古典建筑交相辉映，展现了上海这座城市独特的魅力。漫步南京路步行街，感受市井生活的烟火气息，品尝各色美食，让人流连忘返。',
      images: ['/uploads/media/images/shanghai.jpg'],
      videoUrl: null,
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

// 执行初始化
const init = async () => {
  try {
    await clearData();
    const admin = await createAdmin();
    const users = await createUsers();
    await createSamplePosts([...users, admin]);
    
    console.log('数据库初始化完成');
    console.log('\n提示：请确保在 uploads/media/images 目录下放置以下图片文件：');
    console.log('- beijing1.jpg      (北京游记图片1)');
    console.log('- beijing2.jpg      (北京游记图片2)');
    console.log('- shanghai.jpg      (上海游记图片)');
    process.exit(0);
  } catch (err) {
    console.error('初始化失败:', err);
    process.exit(1);
  }
};

// 启动初始化流程
init(); 