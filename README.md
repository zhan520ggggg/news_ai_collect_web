# Vue 3 管理后台系统

基于 Vue 3 + TypeScript + Element Plus 构建的现代化管理后台系统，包含完整的路由管理、状态管理、API 请求封装和权限控制。

## 🚀 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **开发语言**: TypeScript
- **UI 组件库**: Element Plus
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **图标库**: @element-plus/icons-vue
- **自动导入**: unplugin-auto-import + unplugin-vue-components
- **代码格式化**: Prettier (待配置)
- **代码检查**: ESLint (待配置)

## 📁 项目结构

```
src/
├── api/                    # API 请求封装
│   ├── modules/           # 模块化 API
│   │   ├── auth.ts        # 认证相关 API
│   │   └── user.ts        # 用户管理 API
│   ├── request.ts         # Axios 实例和拦截器
│   └── index.ts           # API 导出
├── assets/                # 静态资源
├── components/            # 公共组件
├── layout/                # 布局组件
│   └── index.vue          # 主布局组件
├── router/                # 路由配置
│   └── index.ts           # 路由定义和守卫
├── store/                 # 状态管理
│   ├── modules/           # 模块化 store
│   │   ├── auth.ts        # 认证状态
│   │   └── app.ts         # 应用状态（主题、侧边栏等）
│   └── index.ts           # store 导出
├── utils/                 # 工具函数
├── views/                 # 页面组件
│   ├── Login.vue          # 登录页面
│   ├── Dashboard.vue      # 仪表盘页面
│   ├── Users.vue          # 用户管理页面
│   ├── Settings.vue       # 系统设置页面
│   └── NotFound.vue       # 404 页面
├── App.vue                # 根组件
├── main.ts                # 应用入口
├── auto-imports.d.ts      # 自动导入类型声明（自动生成）
└── components.d.ts        # 组件类型声明（自动生成）
```

## 🛠️ 安装和运行

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```
访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 类型检查

```bash
npm run type-check
```

## 📦 脚本命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run lint` | 代码检查 (需配置 ESLint) |
| `npm run format` | 代码格式化 (需配置 Prettier) |

## ✨ 功能特性

### 核心功能
- ✅ 用户登录/注销
- ✅ 路由权限控制
- ✅ 响应式布局
- ✅ 主题切换（亮色/暗色）
- ✅ 侧边栏折叠
- ✅ 面包屑导航
- ✅ 用户头像和下拉菜单

### 页面模块
1. **登录页面** - 用户认证
2. **仪表盘** - 数据统计和图表展示
3. **用户管理** - 用户列表、增删改查、状态管理
4. **系统设置** - 基本设置、安全设置、通知设置
5. **404页面** - 页面不存在处理

### 技术特性
- 🎯 **TypeScript 支持** - 完整的类型定义
- 🔧 **自动导入** - 组件和 API 自动导入，减少样板代码
- 🎨 **Element Plus** - 现代化的 UI 组件库
- 🔐 **权限控制** - 路由守卫和访问控制
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🌓 **主题切换** - 支持亮色/暗色主题

## ⚙️ 环境变量配置

项目使用 Vite 环境变量，配置文件位于项目根目录：

### `.env.development` (开发环境)
```env
VITE_API_BASE_URL=http://localhost:5000
```
默认配置为 .NET Web API 默认端口（5000）。如果后端运行在不同端口，请相应修改。

### `.env.production` (生产环境)
```env
VITE_API_BASE_URL=/api
```

在代码中通过 `import.meta.env.VITE_API_BASE_URL` 访问。

## 🔗 后端 API 集成

### 前端 API 模块
- `src/api/modules/auth.ts` - 认证相关 API
- `src/api/modules/user.ts` - 用户管理 API
- `src/api/modules/products.ts` - 产品管理 API
- `src/api/modules/roles.ts` - 角色管理 API
- `src/api/modules/menus.ts` - 菜单管理 API

### 运行要求
1. 确保后端 .NET Web API 项目正在运行（默认端口：5000）
2. 如果后端使用不同端口，请更新 `.env.development` 文件中的 `VITE_API_BASE_URL`
3. 前端开发服务器运行在 `http://localhost:3000`

### 测试 API 连接
1. 启动后端 API 项目
2. 启动前端开发服务器：`npm run dev`
3. 访问 `http://localhost:3000` 并尝试登录
4. 使用开发者工具查看网络请求，确认 API 调用正常

## 🔧 开发指南

### 添加新页面
1. 在 `src/views/` 目录下创建新的 Vue 组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在 `src/layout/index.vue` 的侧边栏菜单中添加导航项（如果需要）

### 添加新 API
1. 在 `src/api/modules/` 目录下创建新的 API 模块
2. 定义接口类型和 API 函数
3. 在 `src/api/index.ts` 中导出

### 添加新 Store 模块
1. 在 `src/store/modules/` 目录下创建新的 store 模块
2. 使用 `defineStore` 定义状态和操作
3. 在 `src/store/index.ts` 中导出

### 添加新组件
1. 在 `src/components/` 目录下创建组件
2. 组件会自动导入，无需手动导入

## 📄 配置文件

### Vite 配置 (`vite.config.ts`)
- Vue 插件配置
- Element Plus 自动导入
- 路径别名配置
- 开发服务器配置

### TypeScript 配置 (`tsconfig.json`)
- 严格类型检查
- 路径别名映射
- ES2020 目标

## 🎯 待办事项

- [ ] 配置 ESLint 代码检查
- [ ] 配置 Prettier 代码格式化
- [ ] 添加单元测试 (Vitest)
- [ ] 添加 E2E 测试 (Cypress/Playwright)
- [ ] 集成图表库 (ECharts/ApexCharts)
- [ ] 添加国际化支持 (i18n)
- [ ] 实现真实的 API 接口对接
- [ ] 添加 Docker 部署配置
- [ ] 添加 CI/CD 流水线

## 📝 许可证

ISC

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 支持

如有问题或建议，请提交 Issue。

---

**Built with ❤️ using Vue 3 & Element Plus**