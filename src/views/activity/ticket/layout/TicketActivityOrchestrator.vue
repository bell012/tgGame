<template>
  <!--
    与 TicketActivityPage 为兄弟节点：Provider 不嵌在玩法 DOM 内，
    但通过 provide/inject 在 setup 阶段把 spinContext 交给 adapter。
  -->
  <LuckySpinRuntimeProvider v-if="shouldMountSpinProvider" />
  <!--
    Props 来源速查（Page 接收 plain 值，shell 侧用 .value 解包 Ref）：
      visible / game-id     → globalTicketToastState
      is-loading / load-error / activity-session / active-game-index → shell
      is-interaction-locked → spinRuntime（非转盘恒 false）
      winner-records        → useTicketMarquee
      header-data           → 本文件 headerData computed
  -->
  <TicketActivityPage
    :visible="toastState.visible"
    :is-loading="shell.isLoading.value"
    :load-error="shell.loadError.value"
    :is-interaction-locked="isInteractionLocked"
    :activity-session="shell.activitySession.value"
    :winner-records="winnerRecords"
    :game-id="toastState.gameId"
    :header-data="headerData"
    :active-game-index="shell.activeGameIndex.value"
    @close="shell.handleClosePage"
    @open-reminder="handleOpenReminder"
    @retry="shell.loadActivitySession"
    @select="handleGameSelect"
    @prev="handleFooterPrev"
    @next="handleFooterNext"
    @open-voucher-list="handleOpenMyVouchers"
  />
  <!--
    事件：close/retry 直传 shell；reminder/vouchers 经 handler 做守卫；
    select/prev/next 同步 globalTicketToastState 与 activeGameIndex。
  -->
</template>

<script setup lang="ts">
/**
 * 票券活动页编排层
 *
 * 分层：
 * - useTicketActivityShell：session 加载、券种条、关页/结果弹窗后刷新（与玩法无关）
 * - LuckySpinRuntimeProvider：大转盘专用 wheelRef / spin API（懒挂载）
 * - provide 上下文：供 TicketActivityPage → gameRegistry adapter → 各玩法组件 inject
 *
 * 数据流（简）：
 *   openTicketActivity → globalTicketToastState.visible/gameId
 *   → shell.loadActivitySession → activitySession
 *   → TicketActivityPage → resolveGameAdapter(gameId) → 动态玩法组件
 *   lucky_spin 额外：Provider register → spinContext → luckySpinAdapter → LuckySpinWheel
 *
 * inject 消费方：
 *   TICKET_ACTIVITY_CONTEXT_KEY      → stub 玩法、API 参数
 *   TICKET_GAME_RUNTIME_CONTEXT_KEY  → TicketActivityPage → adapter.resolveProps/Listeners
 *   REGISTER_LUCKY_SPIN_RUNTIME_KEY  → LuckySpinRuntimeProvider（仅本文件 provide）
 *
 * shell 副作用（本文件不重复实现）：
 *   visible=true  → loadActivitySession
 *   visible=false → resetModalState + onReset（清 wheel）
 *   结果弹窗关闭  → onResultDismiss + refreshSessionAfterResultDismiss
 *
 * @see GlobalTicketToast.vue          上层入口
 * @see TicketActivityPage.vue        布局 + gameRegistry 驱动
 * @see useTicketActivityShell.ts     session / 券种 / 关页
 * @see LuckySpinRuntimeProvider.vue  大转盘运行时挂载点
 */
// --- 玩法运行时 ---
import LuckySpinRuntimeProvider from '../components/lucky-spin/LuckySpinRuntimeProvider.vue'
import type { LuckySpinRuntimeExpose } from '../components/lucky-spin/useLuckySpinRuntime'
// --- 通用 composable / 工具 ---
import { useLockBodyScroll } from '@/composables/useLockBodyScroll'
import { getLanguageCode } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { useTicketMarquee } from './composables/useTicketMarquee'
// --- 票券模块 shared / shell ---
import { buildGameHeader } from '../shared/gameHeaderConfig'
import { getMbTicketLanguageCopy } from '../shared/mbTicketMapper'
import { getTicketActivityEndUseTime } from '../shared/ticketActivityCountdown'
import { openTicketReminderDialog } from '../shell/ticketDialog'
import {
  TICKET_ACTIVITY_CONTEXT_KEY,
  TICKET_GAME_RUNTIME_CONTEXT_KEY,
  type TicketGameRuntimeContext
} from '../shell/ticketActivityContext'
import { REGISTER_LUCKY_SPIN_RUNTIME_KEY } from '../shell/registerLuckySpinRuntime'
import { getActiveTicketParams, globalTicketToastState } from '../shell/ticketToast'
import { useTicketActivityShell } from '../shell/useTicketActivityShell'
import TicketActivityPage from './TicketActivityPage.vue'
import { computed, onUnmounted, provide, ref, shallowRef, toRef, unref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// =============================================================================
// 全局可见性 & 页面级副作用
// =============================================================================

const { t } = useI18n()

/** 全局单例：visible / gameId / activeTicketRecord / mbTicketRecords */
const toastState = globalTicketToastState

/** 派生 ref 供 shell、跑马灯、锁滚动共用，避免多处直接读 reactive 字段 */
const visible = computed(() => toastState.visible)
useLockBodyScroll(visible)

/** 中奖跑马灯：随 activeTicketRecord.type 切换数据源，见 useTicketMarquee */
const { winnerRecords } = useTicketMarquee(visible)

// =============================================================================
// 大转盘懒加载 & retainSpinProvider 状态机
// =============================================================================
//
// 正常：gameId === lucky_spin → 挂载 Provider → register → spinContext 有值
// 切券中旋转：gameId 已变但 isInteractionLocked → retainSpinProvider=true → 暂不卸载
// 动画结束：isInteractionLocked=false → retainSpinProvider=false → 卸载（若已非转盘）
// 关页：visible=false → 强制 retainSpinProvider=false
//
// 非 lucky_spin 全程不挂载，scratch_card 等玩法零 spin 开销。

/** Provider 通过 register 回写的完整运行时（含 shellHooks、isInteractionLocked） */
const spinRuntime = ref<LuckySpinRuntimeExpose | null>(null)
/** true 时强制保留 Provider（即使 gameId 已离开 lucky_spin） */
const retainSpinProvider = ref(false)

/** 当前展示的是大转盘玩法（且活动页可见） */
const isLuckySpinGame = computed(() => visible.value && toastState.gameId === 'lucky_spin')

/** v-if 条件：当前是转盘，或旋转动画尚未结束需要暂留 DOM */
const shouldMountSpinProvider = computed(() => isLuckySpinGame.value || retainSpinProvider.value)

/** 从转盘切到其他券种且仍在旋转 → 开启暂留，等动画结束再卸载 Provider */
watch(isLuckySpinGame, (active, wasActive) => {
  if (wasActive && !active && unref(spinRuntime.value?.isInteractionLocked)) {
    retainSpinProvider.value = true
  }
})

/** 旋转结束 → 若当前已不是转盘，可安全卸载 Provider */
watch(
  () => unref(spinRuntime.value?.isInteractionLocked),
  spinning => {
    if (!spinning) {
      retainSpinProvider.value = false
    }
  }
)

/** 整页关闭时重置暂留，避免下次打开非转盘玩法仍挂着 Provider */
watch(visible, nextVisible => {
  if (!nextVisible) {
    retainSpinProvider.value = false
  }
})

/**
 * 转盘中锁定 UI：关页、切券、跳我的票券。
 * spinRuntime 可能为 null（非转盘或未挂载），用 ?? false 兜底。
 * unref：isInteractionLocked 在 expose 里是 Ref，需解包再参与 computed。
 */
const isInteractionLocked = computed(() => unref(spinRuntime.value?.isInteractionLocked) ?? false)

/**
 * shell 与 spin 的桥接：
 * - onResultDismiss：结果弹窗关闭后刷新剩余次数等（转盘内部状态）
 * - onReset：关页/重载 session 时重置 wheel（Provider 卸载前回调）
 */
const shell = useTicketActivityShell(visible, {
  isInteractionLocked,
  onResultDismiss: () => void spinRuntime.value?.shellHooks.onResultDismiss?.(),
  onReset: () => void spinRuntime.value?.shellHooks.onReset?.()
})

// =============================================================================
// provide / inject：跨兄弟组件共享运行时（Provider ↔ Page ↔ 玩法组件）
// =============================================================================

/**
 * spin 单独 shallowRef，不用 reactive 包整个 gameRuntimeContext：
 * 直接赋值 spinContext.value 会触发依赖 getter 的 computed 更新；
 * reactive 嵌套 Ref 在 TS 侧易与 TicketGameRuntimeContext 类型冲突。
 */
const spinContext = shallowRef<TicketGameRuntimeContext['spin']>(undefined)

/** 注入 TicketActivityPage；adapter 通过 activitySession / spin 组装玩法 props */
const gameRuntimeContext: TicketGameRuntimeContext = {
  activitySession: shell.activitySession, // Ref，adapter 内读 .value
  isInteractionLocked, // 与 Header / 券种条共用同一把锁
  get spin() {
    // getter 而非固定字段：spinContext 更新时，Page 内 `void gameRuntimeContext.spin` 能建立依赖
    return spinContext.value
  }
}

/** 票券维度上下文：当前 record、API 用的 rowId/ticketId（stub 等 inject） */
provide(TICKET_ACTIVITY_CONTEXT_KEY, {
  activeTicketRecord: toRef(globalTicketToastState, 'activeTicketRecord'),
  getActiveTicketParams
})

/** 玩法区运行时：session + 全局交互锁 + 可选 spin（仅 luckySpinAdapter 读 spin） */
provide(TICKET_GAME_RUNTIME_CONTEXT_KEY, gameRuntimeContext)

/**
 * LuckySpinRuntimeProvider setup 内同步调用（非 onMounted）：
 * 保证 TicketActivityPage 首帧 resolve adapter 时 spinContext 已就绪，避免奖品扇区空白。
 * 卸载时 runtime 传 null，清空 spinContext。
 */
provide(REGISTER_LUCKY_SPIN_RUNTIME_KEY, (runtime: LuckySpinRuntimeExpose | null) => {
  spinRuntime.value = runtime
  spinContext.value = runtime?.spinContext
})

// =============================================================================
// Header 合成：玩法文案（session）+ 票券文案（record）+ 过期时间
// =============================================================================

/**
 * loading 阶段仅有 record，可先展示票券描述与倒计时；
 * session 就绪后 merge buildGameHeader 的 title/theme 等玩法字段。
 * endTime 始终优先取票券 record 上的过期时间（与玩法 session 无关）。
 */
const headerData = computed(() => {
  const record = globalTicketToastState.activeTicketRecord
  const { description: voucherDescription } = getMbTicketLanguageCopy(record, getLanguageCode())
  const voucherEndTime = getTicketActivityEndUseTime(record)

  // session 尚未返回：只展示票券侧文案，title 留空避免闪烁错误玩法名
  if (!shell.activitySession.value) {
    return {
      title: '',
      subtitle: voucherDescription,
      theme: toastState.gameId,
      endTime: voucherEndTime > 0 ? voucherEndTime : undefined
    }
  }

  const baseHeader = buildGameHeader(toastState.gameId, shell.activitySession.value, t)

  // 票券描述优先覆盖玩法默认 subtitle（多语言 mbTicket 文案更准确）
  return {
    ...baseHeader,
    subtitle: voucherDescription || baseHeader.subtitle,
    endTime: voucherEndTime > 0 ? voucherEndTime : undefined
  }
})

// =============================================================================
// 用户操作：编排层只做守卫与路由，业务刷新交给 shell / dialog
// =============================================================================

/** 先关活动页再跳我的票券，转盘中直接忽略 */
const handleOpenMyVouchers = () => {
  if (isInteractionLocked.value) return
  shell.handleClosePage()
  navigateTo('/myVouchers')
}

/** 任务/规则弹窗：数据来自 session（shell 加载时已 merge reminder 上下文） */
const handleOpenReminder = () => {
  if (!shell.activitySession.value) return
  openTicketReminderDialog({
    tasks: shell.activitySession.value.tasks,
    rules: shell.activitySession.value.rules,
    voucherName: headerData.value.title,
    maxPrizeText: shell.activitySession.value.maxPrizeText
  })
}

/**
 * 券种条点击 → applyVoucherSelection：
 * 更新 activeTicketRecord、gameId，必要时 reload session。
 */
const handleGameSelect = (index: number) => {
  shell.applyVoucherSelection(index)
}

/**
 * Footer 左右切换：先改 activeGameIndex，再 apply 同步 global 状态。
 * 两步顺序与 shell 内 prev/next 实现保持一致，避免 index 与 record 不一致。
 */
const handleFooterPrev = () => {
  shell.handleGamePrev()
  shell.applyVoucherSelection(shell.activeGameIndex.value)
}

const handleFooterNext = () => {
  shell.handleGameNext()
  shell.applyVoucherSelection(shell.activeGameIndex.value)
}

/** Esc 关页：与 Header 关闭按钮同走 shell.handleClosePage（含交互锁判断） */
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  shell.handleClosePage()
}

// =============================================================================
// 键盘 & 生命周期（本文件对 visible 的 watch 共三处，职责互不重叠）
// =============================================================================
// 1. retainSpinProvider watch（上文）— 关页时清暂留
// 2. useTicketActivityShell 内部   — 开页 load / 关页 reset
// 3. 下方 Esc 监听                 — document keydown

/** visible 切换时挂载/卸载 Esc 监听，避免活动页关闭后仍响应键盘 */
watch(visible, nextVisible => {
  if (nextVisible) {
    document.addEventListener('keydown', handleEscapeKey)
    return
  }
  document.removeEventListener('keydown', handleEscapeKey)
})

/** 组件销毁兜底：防止 Esc 监听泄漏（例如父级突然 unmount GlobalTicketToast） */
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>
