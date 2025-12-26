# PWA 图标资源说明

## 需要的图标文件

请在 `public` 目录下放置以下图标文件：

### 必需的图标

1. **pwa-192x192.png** (192x192 像素)
   - 用于 Android 设备的应用图标
   - 建议使用纯色背景

2. **pwa-512x512.png** (512x512 像素)
   - 用于 Android 设备的启动画面
   - 建议使用纯色背景

3. **apple-touch-icon.png** (180x180 像素)
   - 用于 iOS 设备的主屏幕图标
   - 建议使用圆角矩形设计

4. **favicon.ico** (32x32 像素)
   - 浏览器标签页图标

5. **mask-icon.svg** (SVG 格式)
   - Safari 固定标签页图标
   - 必须是单色 SVG

## 在线生成工具

你可以使用以下在线工具快速生成所有需要的图标：

1. **PWA Asset Generator**
   - https://www.pwabuilder.com/imageGenerator
   - 上传一张 512x512 的 PNG 图片即可生成所有尺寸

2. **Favicon Generator**
   - https://realfavicongenerator.net/
   - 可以生成所有平台的图标

3. **App Icon Generator**
   - https://icon.kitchen/
   - 专业的 PWA 图标生成工具

## 设计建议

- 使用简洁、易识别的设计
- 确保图标在小尺寸下仍然清晰
- 使用品牌主色调 (#42b883 - Vue 绿色)
- 避免使用过多细节
- 确保图标在浅色和深色背景下都清晰可见

## 快速开始

如果你暂时没有设计好的图标，可以：

1. 使用 Vue.js 的官方 logo
2. 使用项目名称的首字母 "TG"
3. 使用简单的几何图形

## 放置位置

所有图标文件应该放在：
```
tgGame/public/
├── pwa-192x192.png
├── pwa-512x512.png
├── apple-touch-icon.png
├── favicon.ico
└── mask-icon.svg
```

## 验证

图标放置完成后，可以通过以下方式验证：

1. 运行 `npm run build`
2. 检查 `dist` 目录是否包含所有图标
3. 使用 Chrome DevTools 的 Application > Manifest 查看
4. 使用 Lighthouse 进行 PWA 审计

