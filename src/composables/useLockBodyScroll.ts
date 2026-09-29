import type { Ref } from 'vue'
import { usePageScrollLock } from './usePageScrollLock'

/** 锁住背景触摸滚动，保留弹窗内部滚动。 */
export function useLockBodyScroll(visible: Ref<boolean> | (() => boolean)) {
  usePageScrollLock(visible, { preventTouchMove: true })
}
