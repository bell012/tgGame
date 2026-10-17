# 首页自动弹窗频率

公告、签到、现金券、红包、砸金蛋、大转盘、盲盒均已接入。以下规则仅用于自动展示，手动打开不受限制。

## 1. 公共参数与频率

```ts
import { getPopupContext, isPopupContextCurrent } from '@/utils/popupContext'
import { popupKey, resolvePopupMode, shouldShowPopup, markPopupShown } from '@/utils/popupFrequency'

const options = {
  ...getPopupContext(), // memberId、loginSessionId、homeVisitId，直接复用，不手动生成
  key: popupKey('业务命名空间', 1001), // 稳定的业务记录 ID
  mode: resolvePopupMode(1, 'authenticated') // 后台配置 + 登录阶段
}
```

登录后 `authenticated`：

- `0`：不弹窗（`none`）。
- `1`：每日一次（`daily`），按设备本地自然日。
- `2`：每次登录（`each-login`），刷新不算重新登录。
- `4`：高频（`frequent`），每次进入、刷新或返回首页一次，同次访问不重复。

登录前 `guest`：`1` 只弹一次，`2` 高频，其他值不弹。未知配置均按不弹处理。

`shouldShowPopup(options)` 只判断；确认打开后才调用 `markPopupShown(options)`，两次使用同一份参数。

## 2. 公告示例

公告使用 `notice:{rowId}`，按登录状态选择配置。以下为参数示例，不代替现有公告展示流程：

```ts
const notice = {
  rowId: 101,
  loginBeforePopWay: 2, // 游客：高频
  loginAfterPopWay: 1 // 登录后：每日一次
}
const context = getPopupContext()
const loggedIn = Boolean(context.memberId)

const noticeOptions = {
  ...context,
  key: popupKey('notice', notice.rowId),
  mode: resolvePopupMode(
    loggedIn ? notice.loginAfterPopWay : notice.loginBeforePopWay,
    loggedIn ? 'authenticated' : 'guest'
  )
}

const canShowNotice = isPopupContextCurrent(context) && shouldShowPopup(noticeOptions)
// 通过其他业务条件并确认打开后：markPopupShown(noticeOptions)
```

保留公告原有“不再显示”的 24 小时抑制规则。接入位置：`src/components/H5HomePop.vue`。

## 3. 签到示例

签到仅登录后自动展示，使用 `check-in:{rowId}` 和 `loginAfterPopWay`：

```ts
const activity = { rowId: 201, loginAfterPopWay: 2 } // 每次登录
const context = getPopupContext()

const checkInOptions = {
  ...context,
  key: popupKey('check-in', activity.rowId),
  mode: resolvePopupMode(activity.loginAfterPopWay, 'authenticated')
}

const canShowCheckIn =
  Boolean(context.memberId) && isPopupContextCurrent(context) && shouldShowPopup(checkInOptions)
// 按签到队列实际打开后：markPopupShown(checkInOptions)
```

已有流程使用 `src/views/activity/check-in/checkInAutoPopupRules.ts` 的封装，无需重复添加判断：

```ts
// activity 为接口返回的完整 ActivityListItem，context 为请求前保存的上下文。
shouldShowCheckInAutoPopup(activity, context) // 判断
markCheckInAutoPopupShown(activity, context) // 确认打开后记录
```

## 4. 现金券、红包、砸金蛋、大转盘、盲盒示例

这五种玩法共用票券入口。首页已接入，业务不需要分别调用五次：

```ts
import { maybeAutoOpenTicketActivity } from '@/utils/autoOpenTicketActivity'

await maybeAutoOpenTicketActivity() // 无参数：请求票券、判断频率、打开并记录
```

后台字段：`type` 决定玩法，`unusedTicketPopWay` 决定频率，`rowId` 决定唯一 key。

以下仅列关键字段，实际打开使用接口返回的完整票券记录：

```ts
// 现金活动（现金券）：每日一次
const cashVoucher = { rowId: 301, type: 1, unusedTicketPopWay: 1 }

// 红包：每日一次
const redEnvelope = { rowId: 302, type: 2, unusedTicketPopWay: 1 }

// 砸金蛋：每次登录
const goldenEgg = { rowId: 303, type: 3, unusedTicketPopWay: 2 }

// 大转盘：每次首页访问
const luckySpin = { rowId: 304, type: 4, unusedTicketPopWay: 4 }

// 盲盒：不弹窗
const mysteryBox = { rowId: 306, type: 6, unusedTicketPopWay: 0 }
```

五种玩法都按下面方式转换公共参数，**不按玩法另设命名空间**：

```ts
// record 为任意一条票券记录；例如 goldenEgg。
const record = goldenEgg
const options = {
  ...getPopupContext(),
  key: popupKey('ticket', record.rowId), // 此例为 ticket:303
  mode: resolvePopupMode(record.unusedTicketPopWay, 'authenticated') // each-login
}
```

实际票券 ID 使用 `rowId ?? ticketId`：只有 `rowId` 为 `null/undefined` 才回退。缺少有效 ID 不自动展示。修改频率只改 `unusedTicketPopWay`，不改 `type` 或 key。

票券仅登录后自动展示。优先级为：高频 > 每次登录 > 每日一次 > 不弹窗。当前仅判断排序后的第一条；该条受限时不继续找下一条。

用户点击按钮手动打开时，按需选择一个调用，不记录自动展示次数：

```ts
import { openTicketActivity } from '@/utils/openTicketActivity'

// 每行是独立按钮的调用示例，不要顺序执行全部。
openTicketActivity('cash_voucher') // 现金券
openTicketActivity('lucky_red_envelope') // 红包
openTicketActivity('golden_egg') // 砸金蛋
openTicketActivity('lucky_spin') // 大转盘
openTicketActivity('mystery_box') // 盲盒
```

## 5. 新活动的调用顺序

下面的 `loadActivity`、`openModal` 是业务占位方法，请替换为实际实现；假设 `openModal` 同步打开成功：

```ts
const context = getPopupContext() // 必须在请求前保存
if (!context.memberId || !isPopupContextCurrent(context)) return

const record = await loadActivity()
if (!record || !isPopupContextCurrent(context)) return

const options = {
  ...context,
  key: popupKey('my-activity', record.rowId),
  mode: resolvePopupMode(record.loginAfterPopWay, 'authenticated')
}
if (!shouldShowPopup(options)) return

openModal(record)
markPopupShown(options) // 仅在确认实际打开后记录
```

## 6. 注意事项

- key 使用稳定的记录 ID，不拼随机数、时间戳；不同账号、游客、业务 key 相互隔离。
- 请求失败、空数据、切账号或离开首页不记录；活动有效性、资格、展示队列仍由业务判断。
- 判断方法不是并发锁；多个监听应共用入口和处理中状态，避免同时打开。异步打开需再次复核上下文。
- 每日记录退出后保留；高频访问 ID 不因语言初始化或组件重挂载而变化。
- 本地存储不可用时内存兜底；清理数据、换设备或兜底后刷新，无法保证持久去重。旧记录不迁移，升级后可能重新展示一次。
- 公共层不负责跨业务排队，不要再为已接入活动重复添加自动打开入口。

规则测试：`npm run test:popup`。
