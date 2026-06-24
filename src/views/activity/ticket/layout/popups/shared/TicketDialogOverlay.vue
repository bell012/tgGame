<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="fixed inset-0"
          :class="layout === 'result' ? 'bg-black/80 backdrop-blur-sm' : 'bg-mask-60-1'"
          :style="{ zIndex: maskZIndex }"
          @click.self="emit('close')"
        />
      </transition>

      <!-- Reminder: H5 bottom sheet / PC centered modal -->
      <template v-if="layout === 'sheet'">
        <transition v-if="isMobile" name="sheet-transition">
          <div
            v-show="visible"
            class="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] rounded-t-[20px] bg-bg-2 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-5"
            :style="{ zIndex: panelZIndex }"
          >
            <slot />
          </div>
        </transition>

        <transition v-else name="result-popup-transition">
          <div
            v-show="visible"
            class="fixed inset-0 flex items-center justify-center px-4 py-8"
            :style="{ zIndex: panelZIndex }"
            @click.self="emit('close')"
          >
            <section
              role="dialog"
              aria-modal="true"
              class="modal-container w-full max-w-[480px] rounded-[12px] bg-bg-2 px-6 py-5 shadow-[0_18px_54px_rgba(0,0,0,0.32)]"
              @click.stop
            >
              <slot />
            </section>
          </div>
        </transition>
      </template>

      <!-- Result: centered panel + bottom close button -->
      <transition v-else name="result-popup-transition">
        <div
          v-show="visible"
          class="fixed inset-0 flex flex-col items-center justify-center px-6 py-8"
          :style="{ zIndex: panelZIndex }"
          @click.self="emit('close')"
        >
          <section
            role="dialog"
            aria-modal="true"
            class="modal-container w-full"
            :class="panelClass"
          >
            <slot />
          </section>

          <button
            v-if="showCloseButton"
            type="button"
            class="dialog-close-btn mt-6 flex h-10 w-10 items-center justify-center rounded-full text-common-100"
            :aria-label="closeAriaLabel"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'

withDefaults(
  defineProps<{
    visible: boolean
    maskZIndex: number
    panelZIndex: number
    layout?: 'sheet' | 'result'
    panelClass?: string
    showCloseButton?: boolean
    closeAriaLabel?: string
  }>(),
  {
    layout: 'result',
    panelClass: '',
    showCloseButton: true,
    closeAriaLabel: 'Close'
  }
)

const emit = defineEmits<{ close: [] }>()

const isMobile = useIsMobile()
</script>

<style scoped lang="scss">
@use './dialog-transitions.scss';

.dialog-close-btn {
  border: 2px solid rgba(255, 255, 255, 0.8);
}
</style>
