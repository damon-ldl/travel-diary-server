const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const upload = require('../utils/fileUpload');

/**
 * @swagger
 * /api/diaries:
 *   post:
 *     summary: 发布游记
 *     tags: [游记]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, upload.fields([
  { name: 'images', maxCount: 9 },
  { name: 'video', maxCount: 1 }
]), diaryController.createDiary);

/**
 * @swagger
 * /api/diaries:
 *   get:
 *     summary: 获取游记列表
 *     tags: [游记]
 */
router.get('/', diaryController.getDiaries);

/**
 * @swagger
 * /api/diaries/my:
 *   get:
 *     summary: 获取我的游记列表
 *     tags: [游记]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my', auth, diaryController.getMyDiaries);

/**
 * @swagger
 * /api/diaries/{id}:
 *   get:
 *     summary: 获取游记详情
 *     tags: [游记]
 */
router.get('/:id', optionalAuth, diaryController.getDiaryById);

/**
 * @swagger
 * /api/diaries/{id}:
 *   put:
 *     summary: 编辑游记
 *     tags: [游记]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth, upload.fields([
  { name: 'images', maxCount: 9 },
  { name: 'video', maxCount: 1 }
]), diaryController.updateDiary);

/**
 * @swagger
 * /api/diaries/{id}:
 *   delete:
 *     summary: 删除游记
 *     tags: [游记]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth, diaryController.deleteDiary);

module.exports = router; 