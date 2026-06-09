<template>
  <!-- 绑定手机号提示遮罩层 -->
  <div
    v-if="props.modelValue"
    class="fixed inset-0 z-[10020] flex items-center justify-center bg-black/60"
    @click.self="handleClose"
  >
    <!-- H5 绑定手机号提示弹窗 -->
    <section
      v-if="isMobile"
      class="relative h-[367.67px] w-[300px] shrink-0 rounded-[14px] bg-[#242626]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="check-in-bind-phone-title"
    >
      <button
        type="button"
        class="absolute right-[14px] top-[14px] z-10 flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-white/10"
        :aria-label="t('checkIn.bindPhonePromptCloseAriaLabel')"
        @click="handleClose"
      >
        <CloseIcon class="h-[10px] w-[10px] text-common-100" />
      </button>

      <div
        class="absolute left-[20px] top-[20px] flex h-[327.67px] w-[260px] flex-col items-center gap-[30px]"
      >
        <h2
          id="check-in-bind-phone-title"
          class="w-full text-left text-[16px] font-[700] leading-[19.33px] text-common-100"
        >
          {{ t('checkIn.bindPhonePromptTitle') }}
        </h2>

        <div class="flex w-full flex-col items-center gap-[10px]">
          <div class="h-[135px] w-[135px] overflow-hidden">
            <img :src="resolvedImageUrl" alt="" class="h-full w-full object-cover" />
          </div>

          <p class="w-full text-center text-[16px] font-[700] leading-[19.33px] text-common-100">
            {{ t('checkIn.bindPhonePromptHeadline') }}
          </p>

          <p class="w-full text-center text-[14px] font-[400] leading-[17px] text-[#B3BEC1]">
            {{ t('checkIn.bindPhonePromptDescription') }}
          </p>
        </div>

        <button
          type="button"
          class="h-[40px] w-full rounded-[8px] bg-theme-primary text-[14px] font-[700] leading-[17px] text-[#000000]"
          @click="handleConfirm"
        >
          {{ resolvedButtonText }}
        </button>
      </div>
    </section>

    <!-- PC 绑定手机号提示弹窗 -->
    <section
      v-else
      class="flex h-[488px] w-[464px] flex-col items-center justify-center rounded-[24px] bg-[#242626] p-[32px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="check-in-bind-phone-title"
    >
      <div class="flex h-[424px] w-[400px] flex-col items-start gap-[24px]">
        <div class="flex h-[424px] w-[400px] flex-col items-center gap-[24px]">
          <div class="flex h-[24px] w-[400px] items-start justify-between">
            <h2
              id="check-in-bind-phone-title"
              class="flex h-[24px] w-[144px] items-center text-[20px] font-[700] leading-[24px] text-common-100"
            >
              {{ t('checkIn.bindPhonePromptTitle') }}
            </h2>

            <button
              type="button"
              class="relative h-[24px] w-[24px] rounded-[4px] bg-white/10"
              :aria-label="t('checkIn.bindPhonePromptCloseAriaLabel')"
              @click="handleClose"
            >
              <span
                class="absolute left-1/2 top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2"
              >
                <span
                  class="absolute left-1/2 top-1/2 h-[1.5px] w-[14px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white"
                ></span>
                <span
                  class="absolute left-1/2 top-1/2 h-[1.5px] w-[14px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-white"
                ></span>
              </span>
            </button>
          </div>

          <div class="flex h-[304px] w-[294px] flex-col items-center gap-[16px]">
            <img :src="resolvedImageUrl" alt="" class="h-[204px] w-[224px] object-contain" />

            <p
              class="h-[24px] w-[294px] text-center text-[20px] font-[700] leading-[24px] text-common-100"
            >
              {{ t('checkIn.bindPhonePromptHeadline') }}
            </p>

            <p
              class="h-[44px] w-[272px] text-center text-[18px] font-[400] leading-[22px] text-[#B3BEC1]"
            >
              {{ t('checkIn.bindPhonePromptDescription') }}
            </p>
          </div>

          <button
            type="button"
            class="flex h-[48px] w-[400px] items-center justify-center gap-[10px] rounded-[8px] bg-theme-primary p-[8px]"
            @click="handleConfirm"
          >
            <span
              class="flex h-[16px] w-[384px] flex-1 items-center justify-center text-center text-[14px] font-[700] leading-[17px] text-[#000000]"
            >
              {{ resolvedButtonText }}
            </span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import bindPhonePromptImage from '@/static/img/check-in/bind-phone-tip-pc.png'
import CloseIcon from '@/static/svg/close.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CheckInPageMode } from '../shared'

interface Props {
  modelValue?: boolean
  pageMode: CheckInPageMode
  imageUrl?: string
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  imageUrl: bindPhonePromptImage,
  buttonText: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  close: []
}>()

const { t } = useI18n()

// 当前是否使用 H5 版布局。
const isMobile = computed(() => props.pageMode === 'mobile')

// 当前使用的提示图片。
const resolvedImageUrl = computed(() => props.imageUrl || bindPhonePromptImage)

// 主按钮文案，默认走签到国际化。
const resolvedButtonText = computed(() => props.buttonText || t('checkIn.bindPhonePromptAction'))

// 关闭弹窗。
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 点击主按钮。
const handleConfirm = () => {
  emit('confirm')
}
</script>
