<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div v-show="visible" class="fixed inset-0 z-[10020] bg-mask-60-1" @click.self="close" />
      </transition>

      <transition name="center-fade">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10021] flex items-center justify-center"
          @click.self="close"
        >
          <section
            class="relative w-full max-w-[320px] rounded-[14px] bg-bg-1 p-5 md:max-w-[492px] md:rounded-3xl md:p-[32px]"
            role="dialog"
            aria-modal="true"
            :aria-label="t('personalCenter.signOutTitle')"
          >
            <div class="flex items-center justify-between gap-3 mb-3.5 md:mb-6">
              <div class="flex-1 text-base font-[700] text-text-1 md:text-xl">
                {{ t('personalCenter.signOutTitle') }}
              </div>
              <button
                type="button"
                class="flex w-7 h-7 md:h-6 md:w-6 items-center justify-center rounded bg-opacity-10"
                @click="close"
              >
                <CloseIcon class="h-4 w-4 md:h-3 md:w-3 text-text-1" />
              </button>
            </div>

            <p class="mb-[30px] text-left text-sm text-text-2 md:mb-6">
              {{ t('personalCenter.signOutDescription') }}
            </p>

            <div class="flex flex-col gap-3.5 md:hidden">
              <button
                type="button"
                class="flex h-[40px] items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
                @click="handleConfirm"
              >
                {{ t('personalCenter.signOut') }}
              </button>
              <button
                type="button"
                class="flex h-[40px] items-center justify-center rounded-lg bg-opacity-10 text-sm font-[700] text-text-2"
                @click="close"
              >
                {{ t('common.cancel') }}
              </button>
            </div>

            <div class="hidden md:flex md:gap-6">
              <button
                type="button"
                class="flex h-[48px] flex-1 items-center justify-center rounded-lg bg-opacity-10 text-sm font-[700] text-text-2"
                @click="close"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="button"
                class="flex h-[48px] flex-1 items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
                @click="handleConfirm"
              >
                {{ t('personalCenter.signOut') }}
              </button>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    visible: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
}>()

const { t } = useI18n()

const close = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm')
  close()
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;

.center-fade-enter-active,
.center-fade-leave-active {
  transition: opacity 0.2s ease;
}

.center-fade-enter-from,
.center-fade-leave-to {
  opacity: 0;
}

.center-fade-enter-to,
.center-fade-leave-from {
  opacity: 1;
}
</style>
