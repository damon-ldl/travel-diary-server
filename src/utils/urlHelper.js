const config = require('../../config');

/**
 * 将相对路径转换为完整的URL
 * @param {string} path - 相对路径（例如：/uploads/image.jpg）
 * @returns {string} 完整的URL
 */
const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${config.baseUrl}${path}`;
};

/**
 * 将图片路径数组转换为完整URL数组
 * @param {string[]} paths - 图片路径数组
 * @returns {string[]} 完整URL数组
 */
const getFullUrlArray = (paths) => {
  if (!Array.isArray(paths)) return [];
  return paths.map(path => getFullUrl(path));
};

module.exports = {
  getFullUrl,
  getFullUrlArray
}; 