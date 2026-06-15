# layout/dialogs — 票券活动子弹窗

5 玩法共用的二级 overlay 弹窗，由 [`GlobalTicketToast.vue`](../../GlobalTicketToast.vue) 零 props 挂载。

详细模块说明见 [`../../README.md`](../../README.md)。**`layout/` 根目录**下的 `TicketActivityPage`、`TicketVoucher*` 等属于活动页布局，不属于本目录。

---

## 目录结构

```
dialogs/
├── README.md
├── index.ts                         # 对外唯一出口
├── composables/
│   └── useTicketDialogVisible.ts
├── shared/
│   ├── TicketDialogOverlay.vue      # Teleport + 遮罩 + transition
│   ├── dialog-transitions.scss
│   └── goTicketDeposit.ts           # 关活动页并跳转充值
├── reminder/                        # 任务提醒 #2 / 券解锁 #3
│   ├── TicketReminderPopup.vue
│   ├── TicketReminderTasksContent.vue
│   ├── TicketTaskSuccessContent.vue
│   └── useTicketReminderDialog.ts
└── result/                          # 中奖结果 #4~6 + 票券卡片
    ├── TicketResultHeroPopup.vue
    ├── TicketResultCardsPopup.vue
    ├── TicketVoucherCard.vue
    ├── constants.ts
    ├── useTicketResultDialog.ts
    └── useTicketResultCopy.ts
```

---

## 设计稿对照

| 编号 | 说明       | 壳层                     | 内容                          | 打开 API                                            |
| ---- | ---------- | ------------------------ | ----------------------------- | --------------------------------------------------- |
| #2   | 任务提醒   | `TicketReminderPopup`    | `TicketReminderTasksContent`  | `openTicketReminderDialog()`                        |
| #3   | 券解锁成功 | `TicketReminderPopup`    | `TicketTaskSuccessContent`    | `openTicketTaskSuccessDialog()`                     |
| #4   | 现金中奖   | `TicketResultHeroPopup`  | —                             | `openTicketResultDialog({ variant: 'cash' })`       |
| #5   | 再转一次   | `TicketResultHeroPopup`  | —                             | `openTicketResultDialog({ variant: 'spin_again' })` |
| #6   | 未中奖     | `TicketResultHeroPopup`  | —                             | `openTicketResultDialog({ variant: 'no_prize' })`   |
| —    | 票券中奖   | `TicketResultCardsPopup` | `TicketVoucherCard`（列表项） | `openTicketResultDialog({ variant: 'voucher_*' })`  |

关闭任意弹窗：`closeTicketDialog()`；关闭活动页会联动清空弹窗（`closeTicketToast()`）。

---

## 三层职责

| 层级                             | 职责                                                               |
| -------------------------------- | ------------------------------------------------------------------ |
| `shared/TicketDialogOverlay`     | Teleport、遮罩、动画；`layout=sheet`（reminder）或 `layout=result` |
| `*Popup`                         | 读 state、编排内容、调 `closeTicketDialog()`                       |
| `*Content` / `TicketVoucherCard` | 业务 UI；Content 读 state，Card 纯 props                           |

---

## 扩展指南

### 新增 reminder 内容

1. 在 [`shell/ticketDialog.ts`](../../shell/ticketDialog.ts) 增加 kind / state / open API
2. 在 `reminder/` 新建 `*Content.vue`
3. 在 `useTicketReminderDialog.ts` 的 `contentComponent` 分支注册

### 新增 result variant

1. 在 `result/constants.ts` 加入 HERO 或 CARDS variant 列表
2. 在 `useTicketResultCopy.ts` 补充文案分支
3. 若需新布局，扩展 `TicketDialogOverlay` 的 `layout` prop

### 外部引用

```ts
import {
  TicketReminderPopup,
  TicketResultHeroPopup,
  TicketResultCardsPopup
} from '@/views/activity/ticket/layout/dialogs'
```

---

## 禁止事项

- **不在** `GlobalTicketToast` 给弹窗传 props（弹窗自读 `globalTicketDialogState`）
- **不在** `*Content` 里写 Teleport / 遮罩
- **不在** `TicketVoucherCard` 读全局 state
- **不** 引入 wallet/payment 的 `popShell`

Z-index：[`shared/constants.ts`](../../shared/constants.ts) → `TICKET_DIALOG_Z`。
