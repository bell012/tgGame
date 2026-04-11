<template>
  <teleport to="body">
    <transition :name="props.transitionType">
      <div v-if="modelValue" class="pop-overlay" @click="handleOverlayClose">
        <div
          class="pop-shell"
          :class="{
            'pop-shell-full': props.fullHeight,
            'pop-shell-bottom': props.transitionType === 'bottom-sheet'
          }"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  transitionType?: 'modal' | 'drawer-slide' | 'bottom-sheet'
  fullHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  transitionType: 'modal',
  fullHeight: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const handleOverlayClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped lang="scss">
.pop-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-mask-60-1);
}

.pop-shell {
  width: 100%;
}

.pop-shell-full {
  height: 100%;
}

.pop-shell-bottom {
  align-self: flex-end;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .pop-shell,
.modal-leave-active .pop-shell {
  transition: transform 0.3s ease;
}

.modal-enter-from .pop-shell,
.modal-leave-to .pop-shell {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .pop-shell {
    width: auto;
    max-width: 100%;
  }

  .modal-enter-from .pop-shell,
  .modal-leave-to .pop-shell {
    transform: scale(0.9);
  }
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.drawer-slide-enter-to,
.drawer-slide-leave-from {
  transform: translateX(0);
}

.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity 0.3s ease;
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-active .pop-shell,
.bottom-sheet-leave-active .pop-shell {
  transition: transform 0.3s ease;
}

.bottom-sheet-enter-from .pop-shell,
.bottom-sheet-leave-to .pop-shell {
  transform: translateY(100%);
}

.bottom-sheet-enter-to .pop-shell,
.bottom-sheet-leave-from .pop-shell {
  transform: translateY(0);
}
</style>
