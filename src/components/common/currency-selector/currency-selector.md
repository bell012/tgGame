# CurrencySelectorList 使用文档

## 1. 组件定位

`CurrencySelectorList` 是币种选择框的公共业务组件，统一了以下能力：

- 币种列表渲染（图标 + 币种文案）
- 选中态高亮
- 右侧余额展示模式（`balance`）
- 右侧单选模式（`radio`）
- 搜索过滤

组件路径：
`src/components/common/currency-selector/index.vue`

## 2. 已接入页面（4 处）

1. `src/views/settings/preferences/currency-popup.vue`
2. `src/views/personalCenter/components/CurrencyPopup.vue`
3. `src/views/game/detail/h5/currency-select/popup.vue`
4. `src/views/game/detail/desktop/currency-select/popup.vue`

## 3. 基础类型

```ts
type CurrencySelectorMode = 'balance' | 'radio'

type CurrencySelectorOption = {
  value: string
  label: string
  icon: string
  trailingText?: string
  searchKeywords?: string[]
}
```

## 4. Props

- `visible?: boolean`：弹窗可见状态（用于每次打开时重置搜索关键字）
- `options: CurrencySelectorOption[]`：币种选项
- `selectedValue: string`：当前选中币种
- `mode?: 'balance' | 'radio'`：右侧展示模式，默认 `balance`
- `showSearch?: boolean`：是否显示搜索框，默认 `false`
- `searchPlaceholder?: string`：搜索框占位文案
- `sectionLabel?: string`：分组标题（如 `Cash`）
- `listClass?: string`：列表容器 class
- `sectionLabelClass?: string`：分组标题 class
- `itemClass?: string`：选项行 class
- `selectedItemClass?: string`：选中项附加 class
- `labelClass?: string`：币种文案 class
- `trailingClass?: string`：右侧余额文案 class
- `iconClass?: string`：币种图标 class
- `searchWrapperClass?: string`：搜索区容器 class
- `searchInputClass?: string`：搜索输入框 class
- `searchIconClass?: string`：搜索图标 class

## 5. Events

- `@select(value: string)`：选中某个币种后触发

## 6. 使用示例

### 6.1 余额模式（设置页、个人中心）

```vue
<CurrencySelectorList
  :visible="visible"
  :options="options"
  :selected-value="selectedCurrency"
  mode="balance"
  section-label="Cash"
  list-class="mt-5"
  item-class="flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left"
  selected-item-class="bg-opacity-10"
  @select="handleSelect"
/>
```

`options` 示例：

```ts
const options = [
  { value: 'PHP', label: 'PHP', icon: '/flag/php.webp', trailingText: '₱0.00' },
  { value: 'USD', label: 'USD', icon: '/flag/usd.webp', trailingText: '$0.00' }
]
```

### 6.2 单选 + 搜索模式（游戏详情 h5 / pc）

```vue
<CurrencySelectorList
  :visible="visible"
  :options="options"
  :selected-value="selectedId"
  mode="radio"
  show-search
  :search-placeholder="t('home.search')"
  list-class="max-h-[368px] overflow-y-auto"
  item-class="tp-item mb-2.5 flex h-[42px] items-center justify-between rounded-lg px-2.5 cursor-pointer"
  selected-item-class="bg-[var(--color-opacity-10)] tp-item-selected"
  @select="handleSelectByValue"
/>
```

## 7. 迁移建议

- 外层弹窗（蒙层、过渡、位置、圆角）保持各页面自己控制
- 将“列表 + 搜索 + 选中”统一收敛到 `CurrencySelectorList`
- 新页面接入时优先复用该组件，避免再出现重复币种列表逻辑
