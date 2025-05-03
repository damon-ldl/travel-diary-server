const Diary = require('../models/Diary');
const User = require('../models/User');

/**
 * @swagger
 * /api/diaries:
 *   post:
 *     summary: 发布游记
 *     tags: [游记]
 *     security:
 *       - bearerAuth: []
 */
exports.createDiary = async (req, res) => {
  try {
    console.log('收到创建游记请求:', {
      body: req.body,
      files: req.files,
      headers: req.headers
    });
    
    const { title, content } = req.body;
    
    // 处理图片 - 可能来自files上传或body中的URL数组
    let images = [];
    
    // 方式1: 从multipart/form-data中获取上传的文件
    if (req.files && req.files.images) {
      images = req.files.images.map(file => `/uploads/${file.filename}`);
    } 
    // 方式2: 从JSON请求体中获取图片URL数组
    else if (req.body.images && Array.isArray(req.body.images)) {
      images = req.body.images;
    }
    
    // 确保图片列表有效
    if (images.length < 1) {
      return res.status(400).json({ error: '至少需要上传一张图片' });
    }
    
    // 处理视频 - 可能来自files上传或body中的URL
    let videoUrl = null;
    if (req.files && req.files.video && req.files.video.length > 0) {
      videoUrl = `/uploads/${req.files.video[0].filename}`;
    } else if (req.body.video) { // 从JSON中获取视频URL
      videoUrl = req.body.video;
    }

    const newDiary = new Diary({
      title,
      content,
      images,
      videoUrl,
      author: req.user.id,
      status: 'pending'
    });

    const diary = await newDiary.save();

    res.json({
      id: diary._id,
      title: diary.title,
      content: diary.content,
      images: diary.images,
      videoUrl: diary.videoUrl,
      status: diary.status
    });
  } catch (err) {
    console.error('创建游记错误:', err.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * @swagger
 * /api/diaries:
 *   get:
 *     summary: 获取游记列表
 *     tags: [游记]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码，默认1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: 每页数量，默认10
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 按标题或作者昵称搜索关键字
 *     responses:
 *       200:
 *         description: 成功获取游记列表
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
exports.getDiaries = async (req, res) => {
  try {
    // 参数处理
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const keyword = req.query.keyword || '';
    
    // 参数验证
    if (page < 1) {
      return res.status(400).json({ error: '请求参数 page 非法' });
    }
    
    if (pageSize < 1 || pageSize > 50) {
      return res.status(400).json({ error: '请求参数 pageSize 非法' });
    }
    
    const skip = (page - 1) * pageSize;
    
    // 基础查询条件：只返回已审核通过的
    let query = { status: 'approved' };
    
    // 构建搜索条件
    if (keyword) {
      // 创建一个聚合管道，用于连接author表并按关键字搜索
      const diaries = await Diary.aggregate([
        // 第一步：过滤已审核通过的游记
        { $match: { status: 'approved' } },
        // 第二步：关联作者信息
        { $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'authorInfo'
          }
        },
        // 第三步：展开作者信息数组
        { $unwind: '$authorInfo' },
        // 第四步：按照标题或作者昵称进行搜索
        { $match: {
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { 'authorInfo.nickname': { $regex: keyword, $options: 'i' } }
            ]
          }
        },
        // 第五步：按创建时间降序排序
        { $sort: { createdAt: -1 } },
        // 第六步：分页
        { $skip: skip },
        { $limit: pageSize },
        // 第七步：选择需要返回的字段
        { $project: {
            _id: 1,
            title: 1,
            coverImage: 1,
            'authorInfo._id': 1,
            'authorInfo.nickname': 1,
            'authorInfo.avatarUrl': 1
          }
        }
      ]);
      
      // 获取符合条件的总数
      const totalQuery = await Diary.aggregate([
        { $match: { status: 'approved' } },
        { $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'authorInfo'
          }
        },
        { $unwind: '$authorInfo' },
        { $match: {
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { 'authorInfo.nickname': { $regex: keyword, $options: 'i' } }
            ]
          }
        },
        { $count: 'total' }
      ]);
      
      const total = totalQuery.length > 0 ? totalQuery[0].total : 0;
      
      // 格式化响应
      const formattedDiaries = diaries.map(diary => ({
        id: diary._id,
        title: diary.title,
        coverImage: diary.coverImage || (diary.images && diary.images.length > 0 ? diary.images[0] : null),
        author: {
          id: diary.authorInfo._id,
          nickname: diary.authorInfo.nickname,
          avatarUrl: diary.authorInfo.avatarUrl
        }
      }));
      
      // 返回响应
      return res.json({
        total,
        page,
        pageSize,
        diaries: formattedDiaries
      });
    } else {
      // 不需要搜索关键字，使用简单查询
      const total = await Diary.countDocuments(query);
      
      const diaries = await Diary.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('author', ['nickname', 'avatarUrl']);
      
      // 格式化响应
      const formattedDiaries = diaries.map(diary => ({
        id: diary._id,
        title: diary.title,
        coverImage: diary.coverImage || (diary.images.length > 0 ? diary.images[0] : null),
        author: {
          id: diary.author._id,
          nickname: diary.author.nickname,
          avatarUrl: diary.author.avatarUrl
        }
      }));
      
      // 返回响应
      return res.json({
        total,
        page,
        pageSize,
        diaries: formattedDiaries
      });
    }
  } catch (err) {
    console.error('获取游记列表错误:', err.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * @swagger
 * /api/diaries/my:
 *   get:
 *     summary: 获取我的游记列表
 *     tags: [游记]
 *     security:
 *       - bearerAuth: []
 */
exports.getMyDiaries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    const skip = (page - 1) * pageSize;
    
    const total = await Diary.countDocuments({ author: req.user.id });
    
    const diaries = await Diary.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    
    // 格式化响应
    const formattedDiaries = diaries.map(diary => ({
      id: diary._id,
      title: diary.title,
      coverImage: diary.coverImage || (diary.images.length > 0 ? diary.images[0] : null),
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
 * /api/diaries/{id}:
 *   get:
 *     summary: 获取游记详情
 *     tags: [游记]
 */
exports.getDiaryById = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id)
      .populate('author', ['nickname', 'avatarUrl']);
    
    if (!diary) {
      return res.status(404).json({ error: '游记不存在' });
    }

    // 如果游记未审核通过且请求者不是作者或管理员，则拒绝访问
    const isAuthor = req.user && diary.author._id.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (diary.status !== 'approved' && !isAuthor && !isAdmin) {
      return res.status(403).json({ error: '无权限查看该游记' });
    }

    // 格式化响应
    const response = {
      id: diary._id,
      title: diary.title,
      content: diary.content,
      images: diary.images,
      videoUrl: diary.videoUrl,
      author: {
        id: diary.author._id,
        nickname: diary.author.nickname,
        avatarUrl: diary.author.avatarUrl
      },
      status: diary.status
    };
    
    // 如果状态为拒绝，则添加拒绝原因
    if (diary.status === 'rejected') {
      response.reason = diary.reason;
    }
    
    res.json(response);
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
 * /api/diaries/{id}:
 *   put:
 *     summary: 编辑游记
 *     tags: [游记]
 *     security:
 *       - bearerAuth: []
 */
exports.updateDiary = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);

    if (!diary) {
      return res.status(404).json({ error: '游记不存在' });
    }

    // 确保用户是游记作者
    if (diary.author.toString() !== req.user.id) {
      return res.status(403).json({ error: '无权限编辑该游记' });
    }

    // 如果游记已审核通过，则不允许编辑
    if (diary.status === 'approved') {
      return res.status(400).json({ error: '已审核通过的游记不能编辑' });
    }

    const { title, content } = req.body;
    
    // 处理图片 - 可能来自files上传或body中的URL数组
    let images = diary.images; // 默认保留原来的图片
    
    // 方式1: 从multipart/form-data中获取上传的文件
    if (req.files && req.files.images) {
      images = req.files.images.map(file => `/uploads/${file.filename}`);
    } 
    // 方式2: 从JSON请求体中获取图片URL数组
    else if (req.body.images && Array.isArray(req.body.images)) {
      images = req.body.images;
    }
    
    // 确保图片列表有效
    if (images.length < 1) {
      return res.status(400).json({ error: '至少需要上传一张图片' });
    }
    
    // 处理视频 - 可能来自files上传或body中的URL
    let videoUrl = diary.videoUrl; // 默认保留原来的视频
    if (req.files && req.files.video && req.files.video.length > 0) {
      videoUrl = `/uploads/${req.files.video[0].filename}`;
    } else if (req.body.video !== undefined) { // 从JSON中获取视频URL
      videoUrl = req.body.video;
    }

    // 更新字段
    diary.title = title;
    diary.content = content;
    diary.images = images;
    diary.videoUrl = videoUrl;
    // 更新后，状态重置为待审核
    diary.status = 'pending';
    
    await diary.save();
    
    res.json({
      id: diary._id,
      title: diary.title,
      content: diary.content,
      images: diary.images,
      videoUrl: diary.videoUrl,
      status: diary.status
    });
  } catch (err) {
    console.error('更新游记错误:', err.message);
    res.status(500).json({ error: '服务器错误', details: err.message });
  }
};

/**
 * @swagger
 * /api/diaries/{id}:
 *   delete:
 *     summary: 删除游记
 *     tags: [游记]
 *     security:
 *       - bearerAuth: []
 */
exports.deleteDiary = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);

    if (!diary) {
      return res.status(404).json({ error: '游记不存在' });
    }

    // 确保用户是游记作者
    if (diary.author.toString() !== req.user.id) {
      return res.status(403).json({ error: '无权限删除该游记' });
    }

    await diary.remove();
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: '游记不存在' });
    }
    res.status(500).json({ error: '服务器错误' });
  }
}; 