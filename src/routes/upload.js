const express = require('express');
const router = express.Router();
const upload = require('../utils/fileUpload');
const auth = require('../middlewares/auth');

// @route   POST /api/upload
// @desc    上传文件（图片或视频）
// @access  Private
router.post('/', auth, upload.array('files', 10), (req, res) => {
  try {
    if(!req.files) {
      return res.status(400).json({ msg: '没有上传文件' });
    }
    
    // 返回文件路径数组
    const filePaths = req.files.map(file => `/uploads/${file.filename}`);
    
    res.json({ filePaths });
  } catch(err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router; 