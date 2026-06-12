import type { TicketGameRuntimeContext } from '../../shell/ticketActivityContext'
import type { TicketActivityShellOptions } from '../../shell/useTicketActivityShell'
import type { ComputedRef } from 'vue'
import { computed, ref } from 'vue'
import { useLuckySpinGame, type LuckySpinWheelExpose } from './useLuckySpinGame'

export interface LuckySpinRuntimeExpose {
  isInteractionLocked: ComputedRef<boolean>
  shellHooks: Pick<
    TicketActivityShellOptions,
    'isInteractionLocked' | 'onResultDismiss' | 'onReset'
  >
  spinContext: NonNullable<TicketGameRuntimeContext['spin']>
}

/** 大转盘玩法运行时：wheelRef、spin 逻辑、shell 回调、adapter 用 spin 上下文 */
export function useLuckySpinRuntime(): LuckySpinRuntimeExpose {
  const wheelRef = ref<LuckySpinWheelExpose | null>(null)
  const spinRuntime = useLuckySpinGame(wheelRef)

  const isInteractionLocked = computed(() => spinRuntime.isSpinning.value)

  const shellHooks: Pick<
    TicketActivityShellOptions,
    'isInteractionLocked' | 'onResultDismiss' | 'onReset'
  > = {
    isInteractionLocked,
    onResultDismiss: () => spinRuntime.handleResultDismiss(),
    onReset: () => spinRuntime.resetSpinState()
  }

  const spinContext: NonNullable<TicketGameRuntimeContext['spin']> = {
    wheelPrizes: spinRuntime.wheelPrizes,
    canSpin: spinRuntime.canSpin,
    registerWheelRef: spinRuntime.registerWheelRef,
    onGo: spinRuntime.handleWheelGo,
    onSpinEnd: spinRuntime.handleSpinEnd
  }

  return {
    isInteractionLocked,
    shellHooks,
    spinContext
  }
}
