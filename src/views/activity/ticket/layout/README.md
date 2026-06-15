# layout/ — 票券活动 UI

主活动全屏层与二级弹窗并列。**运行时 state** 在 [`../shell/`](../shell/)。

## 结构（一条规则）

> **layout = 活动页 UI（page/widgets/popups）；ticket/shell = 背后 state。**

```
layout/
├── TicketActivityOrchestrator.vue   # 主编排
├── page/                            # 页面壳（遮罩、H5/PC、loading/error）
├── widgets/                         # UI 小块（Header、Ticker、券种条）
├── composables/                     # 全部 9 个 hook
└── popups/                          # 二级 overlay（Reminder、Result）
```

| 路径                                       | 职责                                             |
| ------------------------------------------ | ------------------------------------------------ |
| [`ticket/shell/`](../shell/)               | TS 运行时：toast/dialog state、registry、session |
| `layout/`（Orchestrator → page → widgets） | 主活动全屏 Vue                                   |
| `layout/popups/`                           | 二级弹窗 Vue：Reminder、Result                   |

## composables 分组

| 分组   | 文件                                                                                               | 消费者                   |
| ------ | -------------------------------------------------------------------------------------------------- | ------------------------ |
| 编排   | `useTicketMarquee`、`useLuckySpinProviderMount`、`useTicketActivityHeader`、`useTicketEscapeClose` | Orchestrator             |
| 页面壳 | `useTicketGameSlot`、`useTicketOverlayStyle`、`useTicketDesktopPanelStyle`                         | `page/*`                 |
| 券种条 | `useTicketVoucherCarousel`、`useTicketVoucherSwitcher`                                             | `widgets/TicketVoucher*` |

## 入口

[`GlobalTicketToast.vue`](../GlobalTicketToast.vue) → `TicketActivityOrchestrator` → `page/TicketActivityPage`。
