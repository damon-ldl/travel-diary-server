# 旅游日记平台 REST API 接口文档

## 认证接口（用户注册/登录）

### 用户注册

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | POST                                                         |
| **请求路径**     | `/api/auth/register`                                         |
| **权限要求**     | 无需登录（公开接口）                                         |
| **请求参数**     | Body (JSON): - `username` (string, 必填): 用户名，需唯一 - `password` (string, 必填): 密码 - `nickname` (string, 必填): 用户昵称，需唯一 - `avatar` (file, 可选): 用户头像文件，未上传则使用默认头像 |
| **响应字段**     | - `id` (int): 用户ID - `username` (string): 用户名 - `nickname` (string): 用户昵称 - `avatarUrl` (string): 用户头像URL |
| **成功响应示例** | `{``  "id": 1,``  "username": "alice",``  "nickname": "Alice",``  "avatarUrl": "/images/avatar-default.png"``}` |
| **错误响应示例** | `{``  "error": "昵称已被占用"``}`                            |

### 用户登录

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | POST                                                         |
| **请求路径**     | `/api/auth/login`                                            |
| **权限要求**     | 无需登录（公开接口）                                         |
| **请求参数**     | Body (JSON): - `username` (string, 必填): 用户名 - `password` (string, 必填): 密码 |
| **响应字段**     | - `id` (int): 用户ID - `username` (string): 用户名 - `nickname` (string): 用户昵称 - `avatarUrl` (string): 用户头像URL - `token` (string): 认证令牌（用于后续接口的授权） |
| **成功响应示例** | `{``  "id": 1,``  "username": "alice",``  "nickname": "Alice",``  "avatarUrl": "/images/avatar1.png",``  "token": "abcdef1234567890"``}` |
| **错误响应示例** | `{``  "error": "用户名或密码错误"``}`                        |

## 游记内容接口

### 发布游记

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | POST                                                         |
| **请求路径**     | `/api/diaries`                                               |
| **权限要求**     | 需要登录（用户）                                             |
| **请求参数**     | Body (JSON 或表单): - `title` (string, 必填): 游记标题 - `content` (string, 必填): 游记正文内容 - `images` (file[], 必填): 游记图片文件列表（可上传多张，至少1张） - `video` (file, 可选): 游记视频文件（仅可上传一个） |
| **响应字段**     | - `id` (int): 新增游记的ID - `title` (string): 游记标题 - `content` (string): 游记内容 - `images` (string[]): 已保存的游记图片URL列表 - `videoUrl` (string/null): 已保存的视频URL（如果有） - `status` (string): 游记状态（发布后默认值为`pending` 待审核） |
| **成功响应示例** | `{``  "id": 101,``  "title": "我的新马之旅",``  "content": "第一天游览了鱼尾狮公园...",``  "images": ["/uploads/diary101_pic1.jpg", "/uploads/diary101_pic2.jpg"],``  "videoUrl": null,``  "status": "pending"``}` |
| **错误响应示例** | `{``  "error": "未登录，无法发布游记"``}`                    |

### 获取游记列表

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | GET                                                          |
| **请求路径**     | `/api/diaries`                                               |
| **权限要求**     | 无需登录（返回已审核通过的公开游记）                         |
| **请求参数**     | Query: `page` (int, 可选): 页码，默认1 `pageSize` (int, 可选): 每页数量，默认10 `keyword` (string, 可选): 按标题或作者昵称搜索关键字 |
| **响应字段**     | - `total` (int): 符合条件的游记总数 - `page` (int): 当前页码 - `pageSize` (int): 当前页大小 - `diaries` (object[]): 游记列表，每项包含：`id` (int)，`title` (string)，`coverImage` (string, 封面图片URL)，`author` (object, 作者信息，包含 `id`, `nickname`, `avatarUrl`) |
| **成功响应示例** | `{``  "total": 2,``  "page": 1,``  "pageSize": 10,``  "diaries": [``    {``      "id": 50,``      "title": "浪漫巴厘岛",``      "coverImage": "/uploads/diary50_cover.jpg",``      "author": {``        "id": 8,``        "nickname": "TravelerA",``        "avatarUrl": "/avatars/user8.png"``      }``    },``    {``      "id": 47,``      "title": "东京美食之旅",``      "coverImage": "/uploads/diary47_cover.jpg",``      "author": {``        "id": 9,``        "nickname": "FoodieB",``        "avatarUrl": "/avatars/user9.png"``      }``    }``  ]``}` |
| **错误响应示例** | `{``  "error": "请求参数 page 非法"``}`                      |

### 获取我的游记列表

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | GET                                                          |
| **请求路径**     | `/api/diaries/my`                                            |
| **权限要求**     | 需要登录（仅返回当前登录用户的游记）                         |
| **请求参数**     | Query: `page` (int, 可选): 页码，默认1 `pageSize` (int, 可选): 每页数量，默认10 |
| **响应字段**     | - `total` (int): 当前用户游记总数 - `page` (int): 当前页码 - `pageSize` (int): 当前页大小 - `diaries` (object[]): 当前用户发布的游记列表，每项包含：`id` (int)，`title` (string)，`coverImage` (string)，`status` (string，游记状态：pending/approved/rejected)，`reason` (string，若状态为未通过，则为审核拒绝原因) |
| **成功响应示例** | `{``  "total": 3,``  "page": 1,``  "pageSize": 10,``  "diaries": [``    {``      "id": 101,``      "title": "我的新马之旅",``      "coverImage": "/uploads/diary101_cover.jpg",``      "status": "pending"``    },``    {``      "id": 80,``      "title": "西安古城游",``      "coverImage": "/uploads/diary80_cover.jpg",``      "status": "rejected",``      "reason": "内容不符合要求"``    },``    {``      "id": 75,``      "title": "海边度假记",``      "coverImage": "/uploads/diary75_cover.jpg",``      "status": "approved"``    }``  ]``}` |
| **错误响应示例** | `{``  "error": "未登录，无法获取游记"``}`                    |

### 获取游记详情

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | GET                                                          |
| **请求路径**     | `/api/diaries/{id}`                                          |
| **权限要求**     | 已审核通过的游记公开；待审核/未通过的游记仅作者本人或管理员可查看 |
| **请求参数**     | Path: `id` (int, 必填): 游记ID                               |
| **响应字段**     | - `id` (int): 游记ID - `title` (string): 游记标题 - `content` (string): 游记全文内容 - `images` (string[]): 游记图片URL列表 - `videoUrl` (string/null): 视频播放URL（如果有） - `author` (object): 作者信息，包含 `id`, `nickname`, `avatarUrl` - `status` (string): 游记当前状态 - `reason` (string, 可选): 审核拒绝原因（仅当该游记状态为未通过时返回） |
| **成功响应示例** | `{``  "id": 50,``  "title": "浪漫巴厘岛",``  "content": "我们在巴厘岛度过了难忘的假期...",``  "images": ["/uploads/diary50_pic1.jpg", "/uploads/diary50_pic2.jpg"],``  "videoUrl": null,``  "author": {``    "id": 8,``    "nickname": "TravelerA",``    "avatarUrl": "/avatars/user8.png"``  },``  "status": "approved"``}` |
| **错误响应示例** | `{``  "error": "无权限查看该游记"``}`                        |

### 编辑游记

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | PUT                                                          |
| **请求路径**     | `/api/diaries/{id}`                                          |
| **权限要求**     | 需要登录（仅作者可编辑自己的游记，且游记状态为待审核或未通过） |
| **请求参数**     | Path: `id` (int, 必填): 游记IDBody (JSON 或表单): - `title` (string, 必填): 游记标题 - `content` (string, 必填): 游记内容 - `images` (file[], 必填): 游记图片文件列表（至少1张） - `video` (file, 可选): 游记视频文件（仅可上传一个） |
| **响应字段**     | - `id` (int): 游记ID - `title` (string): 游记标题 - `content` (string): 游记内容 - `images` (string[]): 更新后的图片URL列表 - `videoUrl` (string/null): 更新后的视频URL - `status` (string): 游记状态（编辑保存后状态为`pending` 待审核） - `reason` (string/null): 审核拒绝原因（如果此游记在编辑前是未通过状态，则可能存在之前的拒绝原因） |
| **成功响应示例** | `{``  "id": 80,``  "title": "西安古城游（更新）",``  "content": "修改后的内容...",``  "images": ["/uploads/diary80_pic1.jpg", "/uploads/diary80_pic2_new.jpg"],``  "videoUrl": null,``  "status": "pending"``}` |
| **错误响应示例** | `{``  "error": "缺少必需参数：title"``}`                     |

### 删除游记

| 项目             | 说明                                  |
| ---------------- | ------------------------------------- |
| **请求方法**     | DELETE                                |
| **请求路径**     | `/api/diaries/{id}`                   |
| **权限要求**     | 需要登录（仅作者可删除自己的游记）    |
| **请求参数**     | Path: `id` (int, 必填): 游记ID        |
| **响应字段**     | - `message` (string): 操作结果信息    |
| **成功响应示例** | `{``  "message": "删除成功"``}`       |
| **错误响应示例** | `{``  "error": "无权限删除该游记"``}` |

## 审核接口（管理员）

### 获取待审核游记列表

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | GET                                                          |
| **请求路径**     | `/api/admin/diaries`                                         |
| **权限要求**     | 需要管理员或审核员权限                                       |
| **请求参数**     | Query: `status` (string, 可选): 游记状态过滤，可取值 `pending`/`approved`/`rejected`，不传则默认返回所有状态 `page` (int, 可选): 页码，默认1 `pageSize` (int, 可选): 每页数量，默认10 |
| **响应字段**     | - `total` (int): 符合条件的游记总数 - `page` (int): 当前页码 - `pageSize` (int): 每页数量 - `diaries` (object[]): 游记列表，每项包含：`id` (int)，`title` (string)，`author` (object: 发布用户信息，包含 `id`, `nickname`)，`status` (string)，`reason` (string，若状态为未通过则为拒绝原因) |
| **成功响应示例** | `{``  "total": 2,``  "page": 1,``  "pageSize": 10,``  "diaries": [``    {``      "id": 120,``      "title": "待审核游记 A",``      "author": {``        "id": 5,``        "nickname": "Alice"``      },``      "status": "pending"``    },``    {``      "id": 121,``      "title": "待审核游记 B",``      "author": {``        "id": 6,``        "nickname": "Bob"``      },``      "status": "pending"``    }``  ]``}` |
| **错误响应示例** | `{``  "error": "需要管理员权限"``}`                          |

### 审核通过游记

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | PUT                                                          |
| **请求路径**     | `/api/admin/diaries/{id}/approve`                            |
| **权限要求**     | 需要管理员或审核员权限                                       |
| **请求参数**     | Path: `id` (int, 必填): 游记ID                               |
| **响应字段**     | - `id` (int): 操作的游记ID - `status` (string): 更新后的状态（`approved`已通过） |
| **成功响应示例** | `{``  "id": 120,``  "status": "approved"``}`                 |
| **错误响应示例** | `{``  "error": "游记不存在"``}`                              |

### 审核拒绝游记

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | PUT                                                          |
| **请求路径**     | `/api/admin/diaries/{id}/reject`                             |
| **权限要求**     | 需要管理员或审核员权限                                       |
| **请求参数**     | Path: `id` (int, 必填): 游记IDBody (JSON): - `reason` (string, 必填): 拒绝原因说明 |
| **响应字段**     | - `id` (int): 操作的游记ID - `status` (string): 更新后的状态（`rejected`未通过） - `reason` (string): 审核拒绝原因 |
| **成功响应示例** | `{``  "id": 121,``  "status": "rejected",``  "reason": "内容不符合要求"``}` |
| **错误响应示例** | `{``  "error": "缺少拒绝原因"``}`                            |

### 逻辑删除游记

| 项目             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **请求方法**     | DELETE                                                       |
| **请求路径**     | `/api/admin/diaries/{id}`                                    |
| **权限要求**     | 需要管理员权限（审核员无权删除）                             |
| **请求参数**     | Path: `id` (int, 必填): 游记ID                               |
| **响应字段**     | - `id` (int): 操作的游记ID - `status` (string): 更新后的状态（`deleted`已删除） |
| **成功响应示例** | `{``  "id": 121,``  "status": "deleted"``}`                  |
| **错误响应示例** | `{``  "error": "游记不存在或已被删除"``}`                    |