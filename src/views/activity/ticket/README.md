# 票券活动弹窗（GlobalTicketToast）开发文档

## 1. 模块概述

票券活动弹窗用于展示大转盘、砸金蛋、开盲盒、现金券、红包等票券玩法。弹窗在 `App.vue` 全局挂载 `GlobalTicketToast`，通过 `openTicketToast()` / `openLuckySpin()` 打开。

**UI 结构（自上而下）**

1. `TicketModalHeader` — 标题、副标题、倒计时（theme 随活动变化）
2. 中间玩法组件 — 按 `gameId` 动态渲染
3. `TicketWinnerTicker` — 中奖滚动条
4. `TicketVoucherFooter` — 底部活动切换 + 票券数量

**共用弹窗（`layout/dialogs/`，由 `shell/GlobalTicketToast.vue` 挂载，5 玩法共用）**

1. `layout/dialogs/TicketResultPopup.vue` — 抽奖/玩法结果弹窗（cash / spin_again / voucher 等）
2. `layout/dialogs/TicketReminderPopup.vue` — 任务进度 + 活动规则（顶部「?」按钮触发）
3. `layout/dialogs/TicketVoucherCard.vue` — 结果弹窗内的票券卡片

**阶段 1 范围**

| 活动   | gameId               | 中间组件                                          | 状态     |
| ------ | -------------------- | ------------------------------------------------- | -------- |
| 大转盘 | `lucky_spin`         | `components/lucky-spin/LuckySpinWheel.vue`        | 完整实现 |
| 砸金蛋 | `golden_egg`         | `components/golden-egg/GoldenEggGrid.vue`         | 空壳     |
| 开盲盒 | `mystery_box`        | `components/mystery-box/MysteryBoxGrid.vue`       | 空壳     |
| 现金券 | `cash_voucher`       | `components/cash-voucher/CashVoucherClaim.vue`    | 空壳     |
| 红包   | `lucky_red_envelope` | `components/lucky-red-envelope/RedPacketOpen.vue` | 空壳     |

---

## 2. 目录结构

```
src/views/activity/ticket/
├── index.ts                          # 对外 API 入口
├── 开发文档.md
│
├── GlobalTicketToast.vue             # 兼容层 → shell/GlobalTicketToast.vue
├── ticketToast.ts                    # 兼容层 → shell/ticketToast.ts
├── types.ts                          # 兼容层 → shared/types.ts
├── constants.ts                      # 兼容层 → shared/constants.ts
│
├── shell/                            # 弹窗壳层 & 编排
│   ├── GlobalTicketToast.vue         # App 级容器（实际实现）
│   ├── ticketToast.ts                # openTicketToast / closeTicketToast / switchTicketGame
│   └── registry.ts                   # gameId → 中间组件
│
├── layout/                           # 弹窗共享布局
│   ├── TicketModalHeader.vue         # ① 顶部
│   ├── TicketWinnerTicker.vue        # ③ 滚动条
│   ├── TicketVoucherFooter.vue       # ④ 底部
│   └── dialogs/                      # 二级 overlay 弹窗（5 玩法共用）
│       ├── TicketReminderPopup.vue
│       ├── TicketResultPopup.vue
│       └── TicketVoucherCard.vue
│
├── components/                       # 仅各玩法组件
│   ├── lucky-spin/                   # 大转盘完整实现
│   │   ├── LuckySpinWheel.vue
│   │   ├── useLuckySpinGame.ts
│   │   └── useLuckyWheelConfig.ts
│   ├── golden-egg/                   # 砸金蛋（阶段 1 空壳）
│   │   └── GoldenEggGrid.vue
│   ├── mystery-box/                  # 开盲盒（阶段 1 空壳）
│   │   └── MysteryBoxGrid.vue
│   ├── cash-voucher/                 # 现金券（阶段 1 空壳）
│   │   └── CashVoucherClaim.vue
│   └── lucky-red-envelope/           # 红包（阶段 1 空壳）
│       └── RedPacketOpen.vue
│
└── shared/                           # 跨玩法共享配置
    ├── types.ts
    ├── constants.ts
    ├── design-tokens.ts
    ├── assets.ts
    └── gameHeaderConfig.ts
```

---

## 3. 打开弹窗

```ts
import { openLuckySpin } from '@/utils/openLuckySpin'
import { openTicketActivity } from '@/utils/openTicketActivity'

// 登录校验 + 打开大转盘
openLuckySpin()

// 打开其他票券活动（阶段 1 中间区为空壳）
openTicketActivity('golden_egg')
openTicketActivity('mystery_box')
openTicketActivity('cash_voucher')
openTicketActivity('lucky_red_envelope')
```

```ts
import { openTicketToast } from '@/views/activity/ticket'

openTicketToast({ gameId: 'lucky_spin' })
```

```ts
import { closeTicketToast, switchTicketGame } from '@/views/activity/ticket'

closeTicketToast()
switchTicketGame('golden_egg') // Footer 切换时由 GlobalTicketToast 内部调用
```

---

## 4. 后端 API

统一使用 `Api.activity`（定义于 `src/api/modules/activity.ts`）：

```ts
import Api from '@/api'

const info = await Api.activity.queryLuckySpinInfo()
const result = await Api.activity.doLuckySpin()
```

| 方法                 | 说明           | 阶段 |
| -------------------- | -------------- | ---- |
| `queryLuckySpinInfo` | 大转盘活动信息 | 1    |
| `doLuckySpin`        | 执行抽奖       | 1    |

Mock 数据：`src/api/mock/luckySpin.ts`（`USE_MOCK = true` 时生效）。

统一使用 `Api.activity.*`，`Api.promotion` 已移除。

---

## 5. 注册表

`shell/registry.ts`：

```ts
TICKET_GAME_COMPONENTS = {
  lucky_spin: LuckySpinWheel, // components/lucky-spin/LuckySpinWheel.vue
  golden_egg: GoldenEggGrid, // components/golden-egg/GoldenEggGrid.vue
  mystery_box: MysteryBoxGrid, // components/mystery-box/MysteryBoxGrid.vue
  cash_voucher: CashVoucherClaim, // components/cash-voucher/CashVoucherClaim.vue
  lucky_red_envelope: RedPacketOpen // components/lucky-red-envelope/RedPacketOpen.vue
}
```

`isTicketGameImplemented(gameId)` — 阶段 1 仅 `lucky_spin` 返回 `true`。

---

## 6. 新增活动（后续迭代）

1. 在 `api/interface/activity.ts` 补充类型
2. 在 `api/modules/activity.ts` 补充 HTTP 方法
3. 在 **对应玩法文件夹内** 填充 UI（如 `components/golden-egg/GoldenEggGrid.vue`）；新玩法在 `components/` 下新建独立文件夹（与 `lucky-spin/` 平级）
4. 跨玩法弹窗放 `layout/dialogs/`（与 Header/Footer 同属共享 UI，不要放进 `components/` 或某个玩法子目录）
5. 在 `shared/design-tokens.ts` 补充 theme（若需要）
6. 在 `shared/gameHeaderConfig.ts` / i18n `ticketPage` 补充文案
7. 在 `shell/registry.ts` 注册新组件
8. 更新本文档

---

## 7. 接入点

| 入口                               | 调用              |
| ---------------------------------- | ----------------- |
| 菜单 Lucky Spin / Lucky Wheel      | `openLuckySpin()` |
| 首页轮播 / H5HomePop / contentJump | `openLuckySpin()` |

挂载：`src/App.vue` → `<GlobalTicketToast />`（**不要**在 MainLayout 重复挂载）。

---

## 8. i18n

- 大转盘：`luckySpinPage.*`
- 其他活动 Header：`ticketPage.goldenEgg` / `mysteryBox` / `cashVoucher` / `redPacket`

---

## 9. 变更记录

| 日期       | 说明                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| 2026-06-01 | 初版：GlobalTicketToast + 大转盘完整实现 + 4 活动空壳                                                   |
| 2026-06-01 | 阶段 3 清理：移除 lucky-spin 目录与 promotion API；Menu 接入全部票券入口                                |
| 2026-06-02 | 目录重组：shell/layout/components/shared 四层；各玩法独立子文件夹；根目录保留兼容 re-export             |
| 2026-06-02 | dialogs 提升至 components/dialogs/ 作为 5 玩法共用；LuckySpinReminderPopup 重命名为 TicketReminderPopup |
| 2026-06-02 | dialogs 迁至 layout/dialogs/，与 Header/Footer 同属弹窗共享 UI；components/ 仅保留各玩法                |
