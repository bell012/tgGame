# TG Game

一个基于 Vue 3 + TypeScript + Vite 的现代化前端项目模板。

## 技术栈

- ⚡️ **Vue 3** 
- 🔥 **Vite** 
- 🎨 **Tailwind CSS** 
- 📦 **Pinia** 
- 🛣️ **Vue Router** 
- 🌍 **Vue I18n** 
- 📡 **Axios** 
- 📱 **PWA** 
- 🐶 **Husky** 
- 💪 **TypeScript** 
- 🎯 **ESLint** 
- 💅 **Prettier** 

## 项目结构

```
tgGame/
├── .husky/              # Husky Git hooks 配置
├── src/
│   ├── api/            # API 接口
│   ├── assets/         # 静态资源
│   ├── components/     # 公共组件
│   ├── i18n/           # 国际化配置
│   │   └── locales/    # 语言文件
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia 状态管理
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   └── style.css       # 全局样式
├── .env                # 环境变量
├── .env.development    # 开发环境变量
├── .env.production     # 生产环境变量
├── .eslintrc.cjs       # ESLint 配置
├── .prettierrc.json    # Prettier 配置
├── index.html          # HTML 模板
├── package.json        # 项目依赖
├── postcss.config.js   # PostCSS 配置
├── tailwind.config.js  # Tailwind CSS 配置
├── tsconfig.json       # TypeScript 配置
└── vite.config.ts      # Vite 配置
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## PWA 功能

本项目已配置完整的 PWA 支持，包括：

### ✨ 主要特性

- 📱 **可安装** - 用户可以将应用添加到主屏幕
- 🔄 **自动更新** - 检测到新版本时自动提示更新
- 📴 **离线支持** - 使用 Service Worker 缓存资源，支持离线访问
- ⚡ **快速加载** - 缓存策略优化，提升加载速度
- 🎨 **原生体验** - 全屏显示，隐藏浏览器地址栏

### 🔧 PWA 配置

PWA 配置位于 `vite.config.ts` 中，包括：

- **Manifest 配置** - 应用名称、图标、主题色等
- **Service Worker** - 自动生成和注册
- **缓存策略** - 针对不同资源类型的缓存策略
  - 静态资源：预缓存
  - API 请求：网络优先
  - 字体文件：缓存优先

### 📱 图标资源

需要在 `public` 目录下放置以下图标：

- `pwa-192x192.png` - Android 应用图标
- `pwa-512x512.png` - Android 启动画面
- `apple-touch-icon.png` - iOS 主屏幕图标
- `favicon.ico` - 浏览器标签页图标
- `mask-icon.svg` - Safari 固定标签页图标

详细说明请查看 `public/PWA_ICONS_README.md`

### 🧪 测试 PWA

1. **本地测试**
   ```bash
   npm run build
   npm run preview
   ```

2. **使用 Chrome DevTools**
   - 打开 DevTools > Application > Manifest
   - 检查 Service Worker 状态
   - 使用 Lighthouse 进行 PWA 审计

3. **移动设备测试**
   - 使用 HTTPS 部署（PWA 要求）
   - 在移动浏览器中访问
   - 查看"添加到主屏幕"提示

### 📦 部署注意事项

- PWA 需要 HTTPS 环境（localhost 除外）
- 确保所有图标文件都已正确放置
- 首次访问后，Service Worker 会在后台注册
- 更新应用时，用户会收到更新提示

## 功能特性

### 🎨 Tailwind CSS
已配置 Tailwind CSS，可以直接使用实用类进行样式开发。

### 📦 Pinia 状态管理
在 `src/stores/` 目录下创建你的 store：
- `counter.ts` - 计数器示例
- `user.ts` - 用户信息示例

### 🌍 国际化 (i18n)
支持中英文切换，语言文件位于 `src/i18n/locales/`。

### 📡 Axios 请求封装
已配置请求和响应拦截器，支持：
- 自动添加 token
- 统一错误处理
- 请求/响应拦截

### 🐶 Git Hooks
使用 Husky 在提交前自动运行 ESLint 检查。

## 环境变量

在 `.env` 文件中配置环境变量：

```
VITE_API_BASE_URL=/api
```

## License

ISC

