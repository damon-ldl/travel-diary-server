const multer = require('multer');
const path = require('path');

// 设置存储引擎
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// 检查文件类型
const fileFilter = (req, file, cb) => {
  // 接受的文件类型
  const filetypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
  // 检查扩展名
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // 检查mime类型
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('不支持该文件类型'));
  }
};

// 初始化上传
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 限制文件大小为10MB
  fileFilter: fileFilter
});

module.exports = upload; 