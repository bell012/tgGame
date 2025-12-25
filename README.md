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

