# 旅行日记服务端系统

## 项目概述

旅行日记服务端系统是一个提供API接口支持的后端服务，使用Node.js和Express框架构建。系统支持用户认证、内容发布、审核和管理等功能，为旅行日记平台提供完整的后端支持。

## 功能特点

### 核心功能
- **用户认证**：支持用户注册、登录和身份验证
- **内容管理**：
  - 支持用户发布文本、图片和视频内容
  - 提供游记的增删改查功能
  - 支持文件上传和存储
- **审核系统**：
  - 支持管理员审核用户发布的内容
  - 提供审核通过/拒绝接口
  - 审核日志记录功能
- **API接口**：提供RESTful API接口，支持前端和移动端调用

### 角色与权限
- **普通用户**：可以注册账号、发布游记、浏览内容
- **管理员**：拥有所有权限，包括内容审核和用户管理

## 技术栈

- **后端框架**：Node.js、Express
- **数据库**：MongoDB
- **认证系统**：JWT (JSON Web Token)
- **文档系统**：Swagger
- **文件处理**：Multer
- **运行监控**：Nodemon (开发环境)

## 安装与运行

### 环境要求
- Node.js (v14+)
- MongoDB (v4+)

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/damon-ldl/travel-diary-server.git
cd travel-diary-server
```

2. 安装依赖
```bash
npm install
```

3. 安装并启动MongoDB (Windows)
   - 从[MongoDB官网](https://www.mongodb.com/try/download/community)下载并安装MongoDB Community Server
   - 安装时可以选择安装为Windows服务，这样MongoDB会随Windows自动启动
   - 或者手动启动MongoDB服务:
     ```bash
     # 在MongoDB安装目录的bin文件夹下运行
     mongod --dbpath="C:\data\db"
     ```
   - 确保MongoDB服务已启动，服务器将自动连接到默认地址: 
     ```
     mongodb://localhost:27017/travel-diary
     ```

4. 初始化数据库（可选）
   这将创建管理员账户和一些示例数据：
   ```bash
   npm run init-db
   ```

   初始账户信息：
   - 管理员账户: admin@example.com / admin123
   - 普通用户1: user1@example.com / user123
   - 普通用户2: user2@example.com / user123

5. 启动服务器
   开发环境（使用nodemon监控文件变化）：
   ```bash
   npm run dev
   ```

   生产环境：
   ```bash
   npm start
   ```

   服务器默认运行在 http://localhost:5000

### 文件上传
系统支持图片和视频上传，上传的文件将保存在`uploads`目录中。

在Windows下创建上传目录：
```bash
mkdir uploads
```

## API文档与调试

### Swagger文档界面
项目已集成Swagger文档系统，提供交互式API调试界面：

1. 启动服务器后，访问以下地址查看API文档：
   ```
   http://localhost:5000/api-docs
   ```

2. 在Swagger UI界面中，您可以：
   - 浏览所有API端点及其详细说明
   - 直接在浏览器中测试API请求
   - 查看请求参数和响应格式
   - 使用JWT令牌进行认证（点击右上角的"Authorize"按钮）

### 使用Swagger进行API测试步骤

1. 首先在`/api/auth/register`或`/api/auth/login`端点获取JWT令牌
2. 点击右上角的"Authorize"按钮
3. 在弹出的对话框中输入获取到的JWT令牌（不需要添加Bearer前缀）
4. 授权后即可测试需要认证的接口

### 其他文档
详细的API接口文档请查看 [API-DOCS.md](./API-DOCS.md)

## 项目结构

```
server/               # 后端服务器项目根目录
├── src/              # 源代码目录
│   ├── models/       # 数据模型定义（Mongoose 模式）
│   │   ├── User.js   # 用户模型（User）
│   │   └── Post.js   # 游记模型（Post）
│   ├── controllers/  # 控制器（业务逻辑）
│   │   ├── authController.js   # 认证相关逻辑（注册、登录）
│   │   ├── postController.js   # 游记发布与查询逻辑
│   │   └── adminController.js  # 管理员审核逻辑
│   ├── routes/       # 路由定义
│   │   ├── auth.js   # 认证相关路由（/api/auth/...）
│   │   ├── posts.js  # 游记相关路由（/api/posts/...）
│   │   ├── admin.js  # 管理端相关路由（/api/admin/...）
│   │   └── upload.js # 文件上传路由（/api/upload/...）
│   ├── middlewares/  # 中间件
│   │   └── auth.js   # JWT鉴权中间件（验证token及权限）
│   ├── utils/        # 工具模块（如文件上传、格式化等辅助函数）
│   │   └── fileUpload.js # 文件上传处理工具
│   ├── swagger.js    # Swagger文档配置
│   └── app.js        # 应用入口（配置Express服务器）
├── server.js         # 服务器启动文件
├── config.js         # 配置文件（数据库连接、JWT密钥等）
├── scripts/          # 脚本文件
│   └── initDB.js     # 数据库初始化脚本
└── uploads/          # 文件上传目录
```

## 后续开发计划

### 近期计划
1. **完善用户个人资料功能**
   - 添加头像上传和管理
   - 增加用户个人资料编辑功能
   - 实现用户关注和粉丝系统

2. **增强游记功能**
   - 添加游记评论和点赞功能
   - 实现游记分类和标签筛选
   - 开发游记推荐算法

### 中长期计划
1. **优化系统性能**
   - 添加Redis缓存减轻数据库压力
   - 实现分页查询优化大数据量加载
   - 图片和视频处理优化，支持压缩和CDN分发

2. **增强安全性**
   - 添加请求频率限制防止暴力攻击
   - 实现更完善的权限控制系统
   - CSRF/XSS防护措施

## 许可证

此项目采用 MIT 许可证 - 详细信息请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

项目维护者：[黎栋梁] - [cassielldl@gmail.com](mailto:cassielldl@gmail.com)

---

© 2025 旅行日记服务端系统. 保留所有权利。