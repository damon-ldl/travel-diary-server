module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/travel-diary',
  jwtSecret: process.env.JWT_SECRET || 'travel-diary-secret-token',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  uploadDir: process.env.UPLOAD_DIR || 'uploads'
}; 