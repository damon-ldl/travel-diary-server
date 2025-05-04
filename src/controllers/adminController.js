const Diary = require('../models/Diary');
const User = require('../models/User');

/**
 * @swagger
 * /api/admin/diaries:
 *   get:
 *     summary: 获取待审核游记列表（管理员）
 *     tags: [管理员]
 */
exports.getDiaries = async (req, res) => {
  try {
    // 不再验证管理员权限
    
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const status = req.query.status || null;
    
    const skip = (page - 1) * pageSize;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const total = await Diary.countDocuments(query);
    
    const diaries = await Diary.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('author', ['nickname']);
    
    // 格式化响应
    const formattedDiaries = diaries.map(diary => ({
      id: diary._id,
      title: diary.title,
      author: {
        id: diary.author._id,
        nickname: diary.author.nickname
      },
      status: diary.status,
      reason: diary.status === 'rejected' ? diary.reason : undefined
    }));
    
    res.json({
      total,
      page,
      pageSize,
      diaries: formattedDiaries
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * @swagger
 * /api/admin/diaries/{id}/approve:
 *   put:
 *     summary: 审核通过游记（管理员）
 *     tags: [管理员]
 */
exports.approveDiary = async (req, res) => {
  try {


    const diary = await Diary.findById(req.params.id);
    
    if (!diary) {
      return res.status(404).json({ error: '游记不存在' });
    }
    
    diary.status = 'approved';
    await diary.save();
    
    res.json({
      id: diary._id,
      status: diary.status
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: '游记不存在' });
    }
    res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * @swagger
 * /api/admin/diaries/{id}/reject:
 *   put:
 *     summary: 审核拒绝游记（管理员）
 *     tags: [管理员]
 */
exports.rejectDiary = async (req, res) => {
  try {


    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: '缺少拒绝原因' });
    }

    const diary = await Diary.findById(req.params.id);
    
    if (!diary) {
      return res.status(404).json({ error: '游记不存在' });
    }
    
    diary.status = 'rejected';
    diary.reason = reason;
    await diary.save();
    
    res.json({
      id: diary._id,
      status: diary.status,
      reason: diary.reason
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: '游记不存在' });
    }
    res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * @swagger
 * /api/admin/diaries/{id}:
 *   delete:
 *     summary: 逻辑删除游记（管理员）
 *     tags: [管理员]
 */
exports.deleteDiary = async (req, res) => {
  try {
    // 不再验证管理员权限

    const diary = await Diary.findById(req.params.id);
    
    if (!diary) {
      return res.status(404).json({ error: '游记不存在或已被删除' });
    }
    
    diary.status = 'deleted';
    await diary.save();
    
    res.json({
      id: diary._id,
      status: diary.status
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: '游记不存在' });
    }
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取所有用户列表
exports.getUsers = async (req, res) => {
  try {
    // 不再验证管理员权限

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
    // 不再验证管理员权限

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