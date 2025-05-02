const Post = require('../models/Post');
const User = require('../models/User');

// 创建新游记
exports.createPost = async (req, res) => {
  try {
    const { title, content, location, tags, images, videos } = req.body;

    const newPost = new Post({
      title,
      content,
      location,
      tags: tags.split(',').map(tag => tag.trim()),
      images,
      videos,
      author: req.user.id
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取所有已批准的游记
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .populate('author', ['username', 'avatar']);
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取特定游记
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', ['username', 'avatar']);
    
    if (!post) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    // 如果游记未被批准且请求者不是作者或管理员，则拒绝访问
    if (post.status !== 'approved' && 
        post.author._id.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ msg: '无权访问此游记' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '游记不存在' });
    }
    res.status(500).send('服务器错误');
  }
};

// 获取用户的所有游记
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 更新游记
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    // 确保用户是游记作者
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: '无权更新此游记' });
    }

    // 如果游记已经被批准或拒绝，则不允许更新
    if (post.status !== 'pending') {
      return res.status(400).json({ msg: '此游记已审核，无法更新' });
    }

    const { title, content, location, tags, images, videos } = req.body;

    // 更新字段
    post.title = title;
    post.content = content;
    post.location = location;
    post.tags = tags.split(',').map(tag => tag.trim());
    post.images = images;
    post.videos = videos;
    // 更新后，状态重置为待审核
    post.status = 'pending';
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

// 删除游记
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    // 确保用户是游记作者或管理员
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: '无权删除此游记' });
    }

    await post.remove();
    res.json({ msg: '游记已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '游记不存在' });
    }
    res.status(500).send('服务器错误');
  }
};

// 搜索游记
exports.searchPosts = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // 使用文本搜索
    const posts = await Post.find(
      { 
        $text: { $search: keyword },
        status: 'approved'
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .populate('author', ['username', 'avatar']);
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
}; 