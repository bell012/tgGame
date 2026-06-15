# shell/ — 票券活动运行时（纯 TS）

全局 state、玩法 registry、session 编排。**不含 Vue 组件与 UI composable**（主活动 UI 见 [`../layout/TicketActivityOrchestrator.vue`](../layout/TicketActivityOrchestrator.vue)）。

## 文件职责

| 文件                          | 职责                               |
| ----------------------------- | ---------------------------------- |
| `ticketToast.ts`              | 活动页 visible / session / TaskPop |
| `ticketDialog.ts`             | 二级弹窗 state + open/close API    |
| `ticketActivityContext.ts`    | provide/inject 上下文 key          |
| `registerLuckySpinRuntime.ts` | 大转盘 runtime 注册 key            |
| `gameRegistry.ts`             | 玩法 adapter 注册表                |
| `useTicketActivityShell.ts`   | session 加载、券种切换、关页刷新   |

## 与 layout 的分工

| 路径             | 职责                                                       |
| ---------------- | ---------------------------------------------------------- |
| `ticket/shell/`  | TS 运行时（本目录）                                        |
| `layout/`        | 主活动全屏 Vue（Orchestrator、page、widgets、composables） |
| `layout/popups/` | 二级弹窗 Vue                                               |

## 谁引用 shell

- [`layout/TicketActivityOrchestrator.vue`](../layout/TicketActivityOrchestrator.vue) — 主编排
- [`layout/composables/`](../layout/composables/) — `useTicketGameSlot` 等
- [`components/`](../components/) — 玩法内 `openTicketResultDialog` 等
- [`index.ts`](../index.ts) — 对外导出 toast/dialog API
