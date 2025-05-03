const express = require('express');
const router = express.Router();
const upload = require('../utils/fileUpload');
const auth = require('../middlewares/auth');

// @route   POST /api/upload
// @desc    上传文件（图片或视频）
// @access  Private
router.post('/', auth, upload.array('files', 10), (req, res) => {
  try {
    console.log('上传文件请求：', {
      hasFiles: !!req.files,
      fileCount: req.files ? req.files.length : 0,
      body: req.body
    });
    
    if(!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    // 返回文件路径数组
    const filePaths = req.files.map(file => `/uploads/${file.filename}`);
    
    res.json({ filePaths });
  } catch(err) {
    console.error('文件上传错误:', err.message);
    res.status(500).send({ error: '服务器错误', message: err.message });
  }
});

module.exports = router; 