<template>
  <teleport to="body">
    <transition :name="props.transitionType">
      <div v-if="modelValue" class="withdraw-overlay" @click="handleOverlayClose">
        <div
          class="withdraw-shell"
          :class="{ 'withdraw-shell-full': props.fullHeight }"
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
  transitionType?: 'modal' | 'drawer-slide'
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
.withdraw-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-mask-60-1);
}

.withdraw-shell {
  width: 100%;
}

.withdraw-shell-full {
  height: 100%;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .withdraw-shell,
.modal-leave-active .withdraw-shell {
  transition: transform 0.3s ease;
}

.modal-enter-from .withdraw-shell,
.modal-leave-to .withdraw-shell {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .withdraw-shell,
  .modal-leave-to .withdraw-shell {
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
</style>
