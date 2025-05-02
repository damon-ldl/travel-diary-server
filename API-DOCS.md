# 旅游日记平台 API 接口文档

本文档详细说明了旅游日记平台后端服务的所有API接口。

## 用户认证 API

### 注册新用户
```
POST /api/auth/register
```

请求体:
```json
{
  "username": "用户名",
  "email": "邮箱地址",
  "password": "密码"
}
```

响应:
```json
{
  "token": "JWT令牌"
}
```

### 用户登录
```
POST /api/auth/login
```

请求体:
```json
{
  "email": "邮箱地址",
  "password": "密码"
}
```

响应:
```json
{
  "token": "JWT令牌"
}
```

### 获取当前用户信息
```
GET /api/auth/user
```

请求头:
```
x-auth-token: JWT令牌
```

响应:
```json
{
  "_id": "用户ID",
  "username": "用户名",
  "email": "邮箱地址",
  "avatar": "头像地址",
  "role": "用户角色",
  "createdAt": "创建时间"
}
```

## 游记 API

### 创建游记
```
POST /api/posts
```

请求头:
```
x-auth-token: JWT令牌
```

请求体:
```json
{
  "title": "游记标题",
  "content": "游记内容",
  "location": "旅行地点",
  "tags": "标签1,标签2,标签3",
  "images": ["图片URL1", "图片URL2"],
  "videos": ["视频URL1"]
}
```

响应: 返回创建的游记

### 获取所有已批准的游记
```
GET /api/posts
```

响应: 返回游记数组

### 获取特定游记
```
GET /api/posts/:id
```

请求头:
```
x-auth-token: JWT令牌
```

响应: 返回特定游记

### 获取当前用户的所有游记
```
GET /api/posts/user/me
```

请求头:
```
x-auth-token: JWT令牌
```

响应: 返回当前用户的游记数组

### 更新游记
```
PUT /api/posts/:id
```

请求头:
```
x-auth-token: JWT令牌
```

请求体: 与创建游记相同

响应: 返回更新后的游记

### 删除游记
```
DELETE /api/posts/:id
```

请求头:
```
x-auth-token: JWT令牌
```

响应:
```json
{
  "msg": "游记已删除"
}
```

### 搜索游记
```
GET /api/posts/search?keyword=搜索关键词
```

响应: 返回匹配的游记数组

## 文件上传 API

### 上传文件
```
POST /api/upload
```

请求头:
```
x-auth-token: JWT令牌
Content-Type: multipart/form-data
```

表单数据:
```
files: (文件数组，最多10个)
```

响应:
```json
{
  "filePaths": ["/uploads/文件1", "/uploads/文件2"]
}
```

## 管理员 API

### 获取待审核游记
```
GET /api/admin/posts/pending
```

请求头:
```
x-auth-token: JWT令牌(管理员)
```

响应: 返回待审核游记数组

### 批准游记
```
PUT /api/admin/posts/:id/approve
```

请求头:
```
x-auth-token: JWT令牌(管理员)
```

响应: 返回批准后的游记

### 拒绝游记
```
PUT /api/admin/posts/:id/reject
```

请求头:
```
x-auth-token: JWT令牌(管理员)
```

请求体:
```json
{
  "reason": "拒绝原因"
}
```

响应: 返回被拒绝的游记

### 获取所有用户
```
GET /api/admin/users
```

请求头:
```
x-auth-token: JWT令牌(管理员)
```

响应: 返回用户数组

### 更新用户角色
```
PUT /api/admin/users/:id/role
```

请求头:
```
x-auth-token: JWT令牌(管理员)
```

请求体:
```json
{
  "role": "user/admin"
}
```

响应: 返回更新后的用户 