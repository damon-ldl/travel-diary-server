const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('创建上传目录:', uploadDir);
}

// 设置存储引擎
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // 获取原始文件扩展名
    let ext = path.extname(file.originalname).toLowerCase() || '';
    
    // 如果没有扩展名，根据MIME类型添加
    if (!ext && file.mimetype) {
      if (file.mimetype.startsWith('image/jpeg')) ext = '.jpg';
      else if (file.mimetype.startsWith('image/png')) ext = '.png';
      else if (file.mimetype.startsWith('image/gif')) ext = '.gif';
      else if (file.mimetype.startsWith('image/bmp')) ext = '.bmp';
      else if (file.mimetype.startsWith('image/webp')) ext = '.webp';
      else if (file.mimetype.startsWith('image/')) ext = '.jpg';  // 默认图片扩展名
      else if (file.mimetype.startsWith('video/mp4')) ext = '.mp4';
      else if (file.mimetype.startsWith('video/webm')) ext = '.webm';
      else if (file.mimetype.startsWith('video/quicktime')) ext = '.mov';
      else if (file.mimetype.startsWith('video/')) ext = '.mp4';  // 默认视频扩展名
    }
    
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    console.log('文件上传 - 保存为:', uniqueName);
    console.log('文件信息:', {
      原始名称: file.originalname,
      大小: file.size,
      MIME类型: file.mimetype,
      字段名: file.fieldname
    });
    cb(null, uniqueName);
  }
});

// 初始化上传 - 不使用过滤器，允许所有文件
const upload = multer({
  storage: storage,
  limits: { fileSize: 50000000 } // 限制文件大小为50MB
});

module.exports = upload; 