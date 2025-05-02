const User = require('../models/User');
const Post = require('../models/Post');

// 获取所有待审核游记
exports.getPendingPosts = async (req, res) => {
  try {
    // 确保请求者是管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: '无权访问管理员功能' });
    }

    const posts = await Post.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('author', ['username', 'avatar']);
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 批准游记
exports.approvePost = async (req, res) => {
  try {
    // 确保请求者是管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: '无权访问管理员功能' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    post.status = 'approved';
    post.rejectReason = '';
    
    await post.save();
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '游记不存在' });
    }
    res.status(500).send('服务器错误');
  }
};

// 拒绝游记
exports.rejectPost = async (req, res) => {
  try {
    // 确保请求者是管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: '无权访问管理员功能' });
    }

    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ msg: '请提供拒绝理由' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    post.status = 'rejected';
    post.rejectReason = reason;
    
    await post.save();
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '游记不存在' });
    }
    res.status(500).send('服务器错误');
  }
};

// 获取所有用户列表（管理员功能）
exports.getUsers = async (req, res) => {
  try {
    // 确保请求者是管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: '无权访问管理员功能' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 设置/取消用户的管理员权限
exports.updateUserRole = async (req, res) => {
  try {
    // 确保请求者是管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: '无权访问管理员功能' });
    }

    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ msg: '无效的角色值' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }

    user.role = role;
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '用户不存在' });
    }
    res.status(500).send('服务器错误');
  }
}; 