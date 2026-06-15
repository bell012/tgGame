# task-pop — TaskPop 任务数据

数据源：`/ticket/progress` + threshold 条件 API，映射为 `TaskItem`（完整进度、帮助弹层、多 actionType）。

与 Reminder 弹窗的 `triggerList` 轻量任务模型独立，勿共用 build 函数。
