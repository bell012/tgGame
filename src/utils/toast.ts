import { reactive } from 'vue'

export type GlobalToastType = 'success' | 'fail'

/**
 * 全局 Toast 调用参数。
 */
export interface GlobalToastOptions {
  message: string
  type?: GlobalToastType
  duration?: number
  zIndex?: number
}

/**
 * 全局 Toast 的共享响应式状态。
 */
interface GlobalToastState {
  visible: boolean
  message: string
  type: GlobalToastType
  duration: number
  zIndex: number
  animationKey: number
}

const DEFAULT_TOAST_DURATION = 3000
const DEFAULT_TOAST_Z_INDEX = 999999

let hideTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 全局 Toast 组件读取的状态源。
 */
export const globalToastState = reactive<GlobalToastState>({
  visible: false,
  message: '',
  type: 'success',
  duration: DEFAULT_TOAST_DURATION,
  zIndex: DEFAULT_TOAST_Z_INDEX,
  animationKey: 0
})

/**
 * 清理自动关闭定时器
 */
function clearHideTimer() {
  if (!hideTimer) {
    return
  }

  clearTimeout(hideTimer)
  hideTimer = null
}

/**
 * 兼容字符串和对象两种调用方式。
 */
function normalizeToastOptions(input: string | GlobalToastOptions): GlobalToastOptions {
  return typeof input === 'string' ? { message: input } : input
}

/**
 * 主动关闭当前 Toast。
 */
export function closeToast() {
  clearHideTimer()
  globalToastState.visible = false
}

/**
 * 显示全局 Toast。
 * 新 Toast 会覆盖当前内容，并重新开始倒计时与圆环进度动画。
 */
export function globalShowToast(input: string | GlobalToastOptions) {
  const options = normalizeToastOptions(input)
  const message = options.message?.trim()

  if (!message) {
    return
  }

  clearHideTimer()

  globalToastState.message = message
  globalToastState.type = options.type || 'success'
  globalToastState.duration =
    typeof options.duration === 'number' && options.duration > 0
      ? options.duration
      : DEFAULT_TOAST_DURATION
  globalToastState.zIndex =
    typeof options.zIndex === 'number' ? options.zIndex : DEFAULT_TOAST_Z_INDEX
  globalToastState.animationKey += 1
  globalToastState.visible = true

  hideTimer = setTimeout(() => {
    globalToastState.visible = false
    hideTimer = null
  }, globalToastState.duration)
}
