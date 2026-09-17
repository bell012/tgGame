# MatchVersus（对阵条）

纯展示：主队图标+名称、中间比分、客队图标+名称。数据全部用 props 传入。

路径：`src/views/sports/components/match-versus/`

样式按 Figma「TG Game（深色英文版）」：H5 节点 `14524:108203`（三倍稿 ÷3），PC 队列 `14346:251152` / 比分 `14346:251149`。

### 导入

```vue
<script setup lang="ts">
import MatchVersus from '@/views/sports/components/match-versus/index.vue'
</script>
```

### Props

| 属性            | 类型               | 必填 | 说明                                   |
| --------------- | ------------------ | ---- | -------------------------------------- |
| `homeSrc`       | `string`           | 是   | 主队队徽                               |
| `homeName`      | `string`           | 是   | 主队名称，最多 2 行                    |
| `homeAlt`       | `string`           | 否   | 主队图片 alt，默认等于 `homeName`      |
| `awaySrc`       | `string`           | 是   | 客队队徽                               |
| `awayName`      | `string`           | 是   | 客队名称，最多 2 行                    |
| `awayAlt`       | `string`           | 否   | 客队图片 alt，默认等于 `awayName`      |
| `homeScore`     | `string \| number` | 是   | 主队比分                               |
| `awayScore`     | `string \| number` | 是   | 客队比分                               |
| `centerCaption` | `string`           | 否   | H5 比分下方文案（如 `1X2`）；PC 不展示 |

无点击事件。需要可点时，在外层包按钮或链接。

### 示例

```vue
<template>
  <MatchVersus
    :home-src="homeLogo"
    :home-name="homeName"
    :away-src="awayLogo"
    :away-name="awayName"
    :home-score="homeScore"
    :away-score="awayScore"
    center-caption="1X2"
  />
</template>
```

### 表现

三列网格：第一行队徽 + 比分，第二行队名（H5 中间为 `centerCaption`）。

| 端  | 队徽                           | 队名                                           | 比分                                                                      |
| --- | ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------- |
| H5  | 29×29，列间距 8px              | 12px Regular 白                                | 24px Bold `#2AEE88`，数字间距 8px；caption 11px `#B3BEC1`                 |
| PC  | 36×36，列间距 16px；列宽 128px | 16px 白；主队 Regular 左对齐、客队 Bold 右对齐 | 16px Bold 白，底托 `12px 16px` / 圆角 8px / `bg-opacity-15`，两框间距 8px |

断点：`useIsMobile()`（`max-width: 640px`）。裂图走 `SmartImage`。
