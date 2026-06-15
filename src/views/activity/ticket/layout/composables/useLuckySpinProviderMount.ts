import type { LuckySpinRuntimeExpose } from '../../components/lucky-spin/useLuckySpinRuntime'
import type { ComputedRef, Ref } from 'vue'
import { computed, ref, unref, watch } from 'vue'

export function useLuckySpinProviderMount(options: {
  visible: ComputedRef<boolean>
  gameId: Ref<string>
}) {
  const spinRuntime = ref<LuckySpinRuntimeExpose | null>(null)
  const retainSpinProvider = ref(false)

  const isLuckySpinGame = computed(
    () => options.visible.value && options.gameId.value === 'lucky_spin'
  )

  const shouldMountSpinProvider = computed(() => isLuckySpinGame.value || retainSpinProvider.value)

  watch(isLuckySpinGame, (active, wasActive) => {
    if (wasActive && !active && unref(spinRuntime.value?.isInteractionLocked)) {
      retainSpinProvider.value = true
    }
  })

  watch(
    () => unref(spinRuntime.value?.isInteractionLocked),
    spinning => {
      if (!spinning) {
        retainSpinProvider.value = false
      }
    }
  )

  watch(options.visible, nextVisible => {
    if (!nextVisible) {
      retainSpinProvider.value = false
    }
  })

  const isInteractionLocked = computed(() => unref(spinRuntime.value?.isInteractionLocked) ?? false)

  return {
    spinRuntime,
    shouldMountSpinProvider,
    isInteractionLocked
  }
}
