<template>
  <Teleport to="body">
    <transition name="center-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[10021] flex items-center justify-center bg-mask-60-1"
        @click.self="close"
      >
        <section
          class="w-full max-w-[350px] rounded-[14px] bg-bg-1 p-[20px] pt-[14px]"
          role="dialog"
          aria-modal="true"
          :aria-label="t('common.didntReceiveCode')"
        >
          <div class="flex items-start justify-between">
            <h3 class="flex-1 text-base font-[700] text-text-1">
              {{ t('common.didntReceiveCode') }}
            </h3>

            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-[6px] bg-opacity-10"
              @click="close"
            >
              <CloseIcon class="h-3.5 w-3.5 text-text-1" />
            </button>
          </div>

          <p class="mt-3.5 text-sm font-[400] text-text-2">
            {{ t('common.didntReceiveCodeIntro') }}
          </p>

          <ol class="mt-3.5 space-y-3.5 text-sm font-[400] text-text-2">
            <li>1.{{ t('common.didntReceiveCodeTip1') }}</li>
            <li>2.{{ t('common.didntReceiveCodeTip2') }}</li>
            <li>3.{{ t('common.didntReceiveCodeTip3') }}</li>
          </ol>

          <button
            type="button"
            class="mt-[30px] flex h-[40px] w-full items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
            @click="close"
          >
            {{ t('common.gotIt') }}
          </button>
        </section>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { useI18n } from 'vue-i18n'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()

/**
 * 关闭短信验证码帮助弹窗。
 */
const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
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
