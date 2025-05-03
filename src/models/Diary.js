const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 1;
      },
      message: '至少需要上传一张图片'
    }
  },
  videoUrl: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: function() {
      return this.images && this.images.length > 0 ? this.images[0] : null;
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'deleted'],
    default: 'pending'
  },
  reason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 创建文本索引以支持搜索
DiarySchema.index({ 
  title: 'text', 
  content: 'text'
});

// 保存前自动更新updatedAt字段
DiarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Diary', DiarySchema); 