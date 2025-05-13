const Diary = require('../models/Diary');
const User = require('../models/User');
const { getFullUrl, getFullUrlArray } = require('../utils/urlHelper');

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
      console.log('处理的图片路径:', images);
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
      console.log('处理的视频路径:', videoUrl);
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

    // 返回完整的URL
    res.json({
      id: diary._id,
      title: diary.title,
      content: diary.content,
      images: getFullUrlArray(diary.images),
      videoUrl: getFullUrl(diary.videoUrl),
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
    console.log('获取游记列表请求:', {
      query: req.query,
      user: req.user
    });

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const keyword = req.query.keyword || '';
    
    const skip = (page - 1) * pageSize;
    
    // 基础查询条件
    const query = { status: 'approved' };
    
    // 如果有搜索关键字
    if (keyword) {
      // 使用聚合管道进行搜索
      const diaries = await Diary.aggregate([
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
        { $skip: skip },
        { $limit: pageSize }
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
        coverImage: getFullUrl(diary.coverImage || (diary.images && diary.images.length > 0 ? diary.images[0] : null)),
        author: {
          id: diary.authorInfo._id,
          nickname: diary.authorInfo.nickname,
          avatarUrl: getFullUrl(diary.authorInfo.avatarUrl)
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
    
    // 不需要搜索关键字，使用简单查询
    const total = await Diary.countDocuments(query);
    
    // 如果没有游记，直接返回空列表
    if (total === 0) {
      return res.json({
        total: 0,
        page,
        pageSize,
        diaries: []
      });
    }
    
    const diaries = await Diary.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('author', ['nickname', 'avatarUrl'])
      .lean(); // 使用lean()获取普通JavaScript对象，提高性能
    
    // 格式化响应
    const formattedDiaries = diaries.map(diary => {
      // 确保images数组存在
      const images = diary.images || [];
      return {
        id: diary._id,
        title: diary.title,
        coverImage: getFullUrl(diary.coverImage || (images.length > 0 ? images[0] : null)),
        author: diary.author ? {
          id: diary.author._id,
          nickname: diary.author.nickname,
          avatarUrl: getFullUrl(diary.author.avatarUrl)
        } : null
      };
    });
    
    // 返回响应
    return res.json({
      total,
      page,
      pageSize,
      diaries: formattedDiaries
    });
  } catch (err) {
    console.error('获取游记列表错误:', err.message);
    // 发生错误时也返回空列表
    res.json({
      total: 0,
      page: 1,
      pageSize: 10,
      diaries: []
    });
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
    console.log('获取我的游记列表请求:', {
      userId: req.user.id,
      query: req.query
    });

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    const skip = (page - 1) * pageSize;
    
    const total = await Diary.countDocuments({ author: req.user.id });
    
    const diaries = await Diary.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    
    // 格式化响应
    const formattedDiaries = diaries.map(diary => {
      // 获取封面图片（使用第一张图片作为封面）
      const coverImage = diary.images && diary.images.length > 0 ? diary.images[0] : null;
      
      // 确保使用完整的media路径
      const formattedCoverImage = coverImage ? getFullUrl(coverImage) : null;
      
      console.log('处理游记:', {
        id: diary._id,
        title: diary.title,
        originalCoverImage: coverImage,
        formattedCoverImage: formattedCoverImage,
        allImages: diary.images
      });

      return {
        id: diary._id,
        title: diary.title,
        coverImage: formattedCoverImage,
        images: diary.images.map(img => getFullUrl(img)),
        status: diary.status,
        reason: diary.status === 'rejected' ? diary.reason : undefined,
        createdAt: diary.createdAt
      };
    });
    
    const response = {
      total,
      page,
      pageSize,
      diaries: formattedDiaries
    };

    console.log('返回游记列表:', response);
    res.json(response);
  } catch (err) {
    console.error('获取我的游记列表错误:', err.message);
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
    console.log('获取游记详情:', {
      diaryId: req.params.id,
      user: req.user
    });

    const diary = await Diary.findById(req.params.id)
      .populate('author', ['nickname', 'avatarUrl']);
    
    if (!diary) {
      return res.status(404).json({ error: '游记不存在' });
    }

    // 权限检查：
    // 1. 已审核通过的游记所有人可见
    // 2. 未审核或被拒绝的游记仅作者和管理员可见
    const isAuthor = req.user && diary.author._id.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (diary.status !== 'approved' && !isAuthor && !isAdmin) {
      console.log('游记访问被拒绝:', {
        diaryStatus: diary.status,
        isAuthor,
        isAdmin
      });
      return res.status(403).json({ 
        error: '无权限查看该游记',
        detail: '该游记正在审核中或未通过审核，仅作者和管理员可查看'
      });
    }

    // 格式化响应
    const response = {
      id: diary._id,
      title: diary.title,
      content: diary.content,
      images: getFullUrlArray(diary.images),
      videoUrl: getFullUrl(diary.videoUrl),
      author: {
        id: diary.author._id,
        nickname: diary.author.nickname,
        avatarUrl: getFullUrl(diary.author.avatarUrl)
      },
      status: diary.status,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt
    };
    
    // 如果是作者或管理员，且状态为拒绝，则添加拒绝原因
    if ((isAuthor || isAdmin) && diary.status === 'rejected') {
      response.reason = diary.reason;
    }
    
    console.log('返回游记详情');
    res.json(response);
  } catch (err) {
    console.error('获取游记详情错误:', err.message);
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
      images = req.files.images.map(file => `/uploads/media/images/${file.filename}`);
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
      videoUrl = `/uploads/media/videos/${req.files.video[0].filename}`;
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
      images: getFullUrlArray(diary.images),
      videoUrl: getFullUrl(diary.videoUrl),
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