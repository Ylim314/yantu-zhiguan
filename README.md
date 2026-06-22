# 研途智管：考研学习任务管理系统

“研途智管”是面向考研学生的全栈学习管理系统，支持科目、任务、错题、学习计划、统计分析和个人资料管理。系统在保留原有 Vue 3 界面与组件结构的基础上，增加 Express 后端、SQLite 数据库、JWT 身份认证、Axios 数据请求和多用户数据隔离。

## 技术架构

| 层次 | 技术 | 主要职责 |
| --- | --- | --- |
| 表现层 | Vue 3、TypeScript、Naive UI、ECharts | 页面展示、表单交互和数据可视化 |
| 状态与通信层 | Pinia、Axios、Vue Router | 状态管理、REST API 调用、路由鉴权 |
| 服务层 | Node.js、Express、JWT、bcryptjs | 用户认证、参数校验、业务处理 |
| 数据层 | SQLite | 用户及学习数据持久化、外键约束和用户隔离 |

## 核心功能

- 用户注册、登录、JWT 身份认证和安全退出
- 7 门初始科目、15 条任务、10 条错题和 10 条学习计划
- 科目、任务、错题、计划的完整增删改查与筛选
- 任务详情、错题详情、仪表盘和 ECharts 统计分析
- 个人资料查询与修改
- 每个注册用户拥有独立的初始学习数据，用户之间互不可见
- Axios 请求拦截器自动携带 Token，响应拦截器统一处理认证失效

## 快速开始

### 环境要求

- Node.js 22.12.0 或更高版本
- pnpm 10.x

### 安装与启动

```bash
pnpm install
pnpm dev
```

`pnpm dev` 会同时启动：

- 前端开发服务器：`http://localhost:5173`
- 后端 API：`http://localhost:3000/api`

默认演示账号：

| 用户名 | 密码 |
| --- | --- |
| `admin` | `123456` |

也可以在登录页选择“注册账号”，系统会为新用户创建独立的初始学习数据。

## 构建与测试

```bash
# TypeScript 类型检查和 Vite 生产构建
pnpm build

# 后端接口自动化测试
pnpm test:api

# 构建后由 Express 同时提供 API 和前端静态资源
pnpm start
```

## 配置与数据库

项目首次启动时会自动创建 `server/data/yantu.db`，并完成数据库建表和初始数据写入。可复制 `.env.example` 并按需设置：

| 环境变量 | 说明 |
| --- | --- |
| `PORT` | 后端端口，默认 `3000` |
| `JWT_SECRET` | JWT 签名密钥，部署时必须修改 |
| `JWT_EXPIRES_IN` | Token 有效期，默认 `7d` |
| `DATABASE_PATH` | SQLite 数据库文件路径 |
| `CLIENT_ORIGINS` | 允许跨域的前端来源，多个值用逗号分隔 |

## 目录结构

```text
.
├── server/              # Express 后端、JWT 认证、SQLite 和接口测试
│   ├── data/            # 数据库文件与种子数据
│   └── tests/           # Node.js API 自动化测试
├── src/
│   ├── api/             # Axios 实例、拦截器和业务 API
│   ├── stores/          # Pinia 用户与学习数据 Store
│   ├── components/      # 复用布局和业务组件
│   ├── views/           # 11 个页面
│   ├── router/          # 动态路由与登录守卫
│   └── types/           # TypeScript 类型定义
└── screenshots/         # 功能界面与接口验证截图
```

## 主要 REST API

所有学习业务接口都需要 `Authorization: Bearer <token>`：

| 模块 | 接口 |
| --- | --- |
| 认证 | `POST /api/auth/register`、`POST /api/auth/login`、`GET /api/auth/me` |
| 科目 | `/api/subjects` |
| 任务 | `/api/tasks`、`/api/tasks/:id` |
| 错题 | `/api/mistakes`、`/api/mistakes/:id` |
| 计划 | `/api/plans`、`/api/plans/:id` |
| 个人资料 | `GET /api/profile`、`PUT /api/profile` |

列表接口支持前端使用的状态、科目和关键词筛选。服务端依据 JWT 中的用户编号限定查询范围，保证多用户数据隔离。

## 开源参考

项目页面布局和工程化思路参考 [Vue Naive Admin](https://github.com/zclzone/vue-naive-admin)（MIT License），业务模型、全栈接口、数据库设计和认证流程均针对考研学习管理场景实现。

## 许可证

本项目采用 [MIT License](LICENSE) 开源。
