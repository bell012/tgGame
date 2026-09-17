# MatchOdds（盘口赔率）

纯展示。PC 为可展开行（图1/图2），H5 为三列网格（图3）。数据全部用 props 传入。

路径：`src/views/sports/components/match-odds/`

### 导入

```vue
<script setup lang="ts">
import MatchOdds from '@/views/sports/components/match-odds/index.vue'
import type { OddsMarket } from '@/views/sports/components/match-odds/types'
</script>
```

### Props / 事件

| 名称               | 类型                 | 说明                                                            |
| ------------------ | -------------------- | --------------------------------------------------------------- |
| `markets`          | `OddsMarket[]`       | 盘口列表。PC 按行（第 1 条始终显示，其余仅展开时显示）；H5 按列 |
| `expanded`         | `boolean`            | 仅 PC，默认 `true`。可用 `v-model:expanded`                     |
| `@select`          | `{ market, option }` | 点击某条赔率                                                    |
| `@update:expanded` | `boolean`            | 点击三角                                                        |

### 示例

```vue
<MatchOdds v-model:expanded="expanded" :markets="markets" @select="onSelect" />
```

### 表现

- PC（`14423:256869`）：盘口组之间、标题到赔率行均为 12px；筹码之间 8px；块高 44px、`bg-bg-3`、圆角 8px、内边距 12×16；三角钮内边距 16px。大小盘 `label` 与 `line` 间距 8px。
- H5（3x /3）：列间距 4px；列头到格子 12px；列内格子 4px；两格列 58px、内边距 7×5、文案间距 3px；三格列 37px、内边距 3×10、文案间距 2px。

断点：`useIsMobile()`（`max-width: 640px`）。
