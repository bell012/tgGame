<template>
  <!-- 红包领取成功的全屏提示弹窗。 -->
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <!-- Figma 导出的红包插画作为弹窗主体背景。 -->
      <section
        role="dialog"
        aria-modal="true"
        :aria-label="t('chatPublic.congratulations')"
        class="relative aspect-[264/373] font-inter"
        :class="props.displayMode === 'pc' ? 'w-[400px]' : 'w-[305px]'"
      >
        <img :src="redPacketSuccessImage" alt="" class="absolute inset-0 size-full" />

        <!-- 领取成功标题和奖励金额。 -->
        <div class="absolute inset-x-0 top-[7.5%] text-center text-[#EF1D2B]">
          <p
            class="font-[700]"
            :class="
              props.displayMode === 'pc'
                ? 'text-[32px] leading-[38px]'
                : 'text-[27px] leading-[32px]'
            "
          >
            {{ t('chatPublic.congratulations') }}
          </p>
          <p
            class="mt-[3px] font-[700]"
            :class="
              props.displayMode === 'pc'
                ? 'text-[48px] leading-[58px]'
                : 'text-[42px] leading-[50px]'
            "
          >
            {{ displayAmount }}
          </p>
        </div>

        <!-- 插画内置按钮区域的领取完成状态。 -->
        <p
          class="absolute inset-x-0 top-[72%] text-center font-[700] text-[#EF1D2B]"
          :class="
            props.displayMode === 'pc' ? 'text-[24px] leading-[29px]' : 'text-[22px] leading-[26px]'
          "
        >
          {{ t('chatPublic.claimed') }}
        </p>

        <!-- 余额到账提示。 -->
        <p
          class="absolute inset-x-[15%] top-[85%] text-center text-white"
          :class="
            props.displayMode === 'pc' ? 'text-[12px] leading-[15px]' : 'text-[11px] leading-[13px]'
          "
        >
          {{ t('chatPublic.redPacketCredited') }}
        </p>

        <!-- 关闭领取成功弹窗。 -->
        <button
          type="button"
          :aria-label="t('chatPublic.close')"
          class="absolute left-1/2 flex size-[28px] -translate-x-1/2 items-center justify-center rounded-full border-2 border-common-100 text-[22px] leading-none text-common-100"
          :class="props.displayMode === 'pc' ? '-bottom-[42px]' : '-bottom-[40px]'"
          @click="$emit('close')"
        >
          <redPacketClose aria-hidden="true" />
        </button>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import redPacketSuccessImage from '@/static/img/chat/public/red-packet-success.png'
import redPacketClose from '@/static/svg/chat/public/red-packet-close.svg?component'
import { getCurrencySymbol } from '@/utils/locale'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const props = withDefaults(defineProps<{ amount: string | number; displayMode?: 'h5' | 'pc' }>(), {
  displayMode: 'h5'
})
defineEmits<{ close: [] }>()

const { t } = useI18n()
const { currentCurrencyCode } = useDisplayCurrency()

/** 使用当前账户币种符号展示领取成功的红包金额。 */
const displayAmount = computed(
  () => `${getCurrencySymbol(currentCurrencyCode.value)}${props.amount}`
)
</script>
