const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true // 添加索引以支持搜索
  },
  content: {
    type: String,
    required: true,
    index: true // 添加索引以支持搜索
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    index: true // 添加索引以支持搜索
  },
  images: [String],
  videos: [String],
  tags: {
    type: [String],
    index: true // 添加索引以支持搜索
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建文本索引以支持模糊搜索
PostSchema.index({ 
  title: 'text', 
  content: 'text', 
  location: 'text', 
  tags: 'text' 
});

module.exports = mongoose.model('Post', PostSchema); 