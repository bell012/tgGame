# 票券活动 — 使用说明

路径：`src/views/activity/ticket/` · `GlobalTicketToast` 已在 `App.vue` 全局挂载（**仅一次**）。

业务入口统一用 `@/utils/openTicketActivity` / `openLuckySpin`（含登录校验 + `mbTicketList`）。生产环境勿直接 `openTicketToast`。

---

## 1. 选哪个 API

| 场景                 | 调用                                                    | 当前票                       |
| -------------------- | ------------------------------------------------------- | ---------------------------- |
| 菜单 / 首页 / 运营   | `openTicketActivity(gameId)` 或 `openLuckySpin()`       | 该玩法第一条                 |
| 我的票券「立即使用」 | `openTicketActivity(gameId, { record })`                | 点击的那张                   |
| 弹窗内点券种条       | `switchTicketGame(gameId, record)`                      | 第 i 条 `mbTicketRecords[i]` |
| 本地调试 UI          | `openTicketToast({ gameId })` + 可选 `setTicketSession` | 手动                         |

流程：未登录 → 登录框；已登录 → `mbTicketList` → 无该玩法票 → Toast `noVoucherForActivity`；有票 → 打开弹窗。列表失败 → Toast `mbTicketListFailed`。

---

## 2. 打开具体活动（示例）

### 2.1 五种玩法对照

| 玩法   | `gameId`             | 打开                                       |
| ------ | -------------------- | ------------------------------------------ |
| 大转盘 | `lucky_spin`         | `openLuckySpin()`                          |
| 砸金蛋 | `golden_egg`         | `openTicketActivity('golden_egg')`         |
| 开盲盒 | `mystery_box`        | `openTicketActivity('mystery_box')`        |
| 现金券 | `cash_voucher`       | `openTicketActivity('cash_voucher')`       |
| 红包   | `lucky_red_envelope` | `openTicketActivity('lucky_red_envelope')` |

票券 `type` → `gameId`（`shared/mbTicketMapper.ts` → `TICKET_TYPE_TO_GAME_ID`）：1 现金、2 红包、3 砸金蛋、4 大转盘、5 拼多多（无入口）、6 盲盒。

### 2.2 从任意页面打开（不指定票）

只知道玩法、不关心 `ticketId` 时用（同玩法多张票会默认选中**第一条**）：

````ts
import { openLuckySpin } from '@/utils/openLuckySpin'
import { openTicketActivity } from '@/utils/openTicketActivity'
import type { TicketGameId } from '@/views/activity/ticket'

// 大转盘
openTicketActivity('lucky_spin')
// 砸金蛋 / 盲盒 / 现金券 / 红包
openTicketActivity('golden_egg')
openTicketActivity('mystery_box')
openTicketActivity('cash_voucher')
openTicketActivity('lucky_red_envelope')


```vue
<script setup lang="ts">
import { openLuckySpin } from '@/utils/openLuckySpin'
import { openTicketActivity } from '@/utils/openTicketActivity'

const openGoldenEgg = () => openTicketActivity('golden_egg')
</script>

<template>
  <button type="button" @click="openLuckySpin()">大转盘</button>
  <button type="button" @click="openGoldenEgg">砸金蛋</button>
  <button type="button" @click="openTicketActivity('mystery_box')">盲盒</button>
</template>
````

项目参考：`Menu.vue`（Vouchers 子菜单）、`H5HomePop.vue` / `contentJump.ts`（大转盘）。

### 2.3 打开指定一张票（我的票券）

**必须**传 `record`，否则会打开同玩法第一张：

```ts
import { openTicketActivity } from '@/utils/openTicketActivity'
import { TICKET_TYPE_TO_GAME_ID } from '@/views/activity/ticket/shared/mbTicketMapper'
import type { MbTicketRecord } from '@/api/interface/activity'

function useVoucherNow(record: MbTicketRecord) {
  if (Number(record.type) === 5) return // 拼多多预留

  const gameId = TICKET_TYPE_TO_GAME_ID[Number(record.type)]
  if (!gameId) return

  openTicketActivity(gameId, { record })
}

// 示例：用户点「立即使用」
useVoucherNow(item.rawData)
```

参考：`vouchers/myVouchers/shared.ts` → `handleUseNow`。

### 2.4 弹窗内切换 / 玩法里读参 / 关闭

```ts
import {
  switchTicketGame,
  getActiveTicketParams,
  globalTicketToastState,
  closeTicketToast,
  closeTicketDialog
} from '@/views/activity/ticket'

// 券种条第 i 格（record 与 mbTicketRecords[i] 一致）
switchTicketGame('cash_voucher', globalTicketToastState.mbTicketRecords[i])

// 调接口带当前票
await Api.activity.doLuckySpin(getActiveTicketParams())

// 只关子弹窗 / 关整个活动页
closeTicketDialog()
closeTicketToast() // 含清 session
```

玩法组件读 `ticketId`：见 `components/golden-egg/GoldenEggGrid.vue`（`globalTicketToastState.activeTicketRecord`）。

底部「您有 N 张票券 ›」：关弹窗并跳转 `/myVouchers`。

---

## 3. 子弹窗（叠在活动页上）

从 `@/views/activity/ticket` 引入，由全局 state 驱动，勿给弹窗传 props。

| 场景     | API                                                                       |
| -------- | ------------------------------------------------------------------------- |
| 任务提醒 | `openTicketReminderDialog({ tasks, rules, voucherName?, maxPrizeText? })` |
| 券解锁   | `openTicketTaskSuccessDialog({ voucherName, rules })`                     |
| 中奖结果 | `openTicketResultDialog({ variant, highlightText?, vouchers? })`          |

`variant`：`cash` | `spin_again` | `no_prize` | `voucher_single` | `voucher_multi`。详情见 [`layout/dialogs/README.md`](layout/dialogs/README.md)。

---

## 4. 实现状态与关键文件

| `gameId`     | 组件               | 状态                           |
| ------------ | ------------------ | ------------------------------ |
| `lucky_spin` | `LuckySpinWheel`   | ✅                             |
| 其余四种     | `GoldenEggGrid` 等 | ⏳ 空壳（Header + 券种条已有） |

| 用途            | 文件                                                     |
| --------------- | -------------------------------------------------------- |
| 业务入口        | `src/utils/openTicketActivity.ts`、`openLuckySpin.ts`    |
| 会话 / 开关弹窗 | `shell/ticketToast.ts`                                   |
| 票映射          | `shared/mbTicketMapper.ts`                               |
| 页面            | `GlobalTicketToast.vue`、`layout/TicketActivityPage.vue` |

---

## 5. 注意

1. 入口只用 `openTicketActivity` / `openLuckySpin`，调试才用 `openTicketToast`。
2. 我的票券必须 `openTicketActivity(gameId, { record })`。
3. 仅大转盘有完整逻辑；其它玩法用 `getActiveTicketParams()` 接 API。
4. 倒计时在 `ticket/shared/ticketActivityCountdown.ts`，与「我的票券」分开维护。
5. 新增玩法：`TicketGameId` → `registry.ts` → `components/` → `TICKET_TYPE_TO_GAME_ID` → 入口调 `openTicketActivity`。
