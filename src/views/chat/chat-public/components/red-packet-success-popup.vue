<template>
  <!-- 红包领取成功的全屏提示弹窗。 -->
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] bg-mask-60-1">
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="t('chatPublic.congratulations')"
        class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center font-inter"
        :class="
          props.displayMode === 'pc'
            ? 'h-[620px] w-[396px] gap-[40px]'
            : 'w-[274.67px] gap-[13.33px]'
        "
      >
        <!-- Figma 导出的红包插画作为奖励卡片背景。 -->
        <section
          class="relative shrink-0 overflow-hidden"
          :class="
            props.displayMode === 'pc'
              ? 'h-[540px] w-[396px] rounded-[30px]'
              : 'h-[377.33px] w-[274.67px] rounded-[18.67px]'
          "
        >
          <img :src="redPacketSuccessImage" alt="" class="size-full object-cover" />

          <!-- 领取成功标题和奖励金额。 -->
          <div
            class="absolute left-1/2 flex -translate-x-1/2 flex-col items-center text-center text-[#E71727]"
            :class="
              props.displayMode === 'pc'
                ? 'top-[42px] w-[254px] gap-[16px]'
                : 'top-[28px] w-[182.33px] gap-[11px]'
            "
          >
            <p
              class="font-[700]"
              :class="
                props.displayMode === 'pc'
                  ? 'h-[39px] text-[32px] leading-[39px]'
                  : 'h-[28px] text-[23px] leading-[28px]'
              "
            >
              {{ t('chatPublic.congratulations') }}
            </p>
            <p
              class="mt-[3px] font-[700]"
              :class="
                props.displayMode === 'pc'
                  ? 'mt-0 h-[73px] w-[213px] text-[60px] leading-[73px]'
                  : 'mt-0 h-[52px] w-[152.67px] text-[43px] leading-[52px]'
              "
            >
              {{ displayAmount }}
            </p>
          </div>

          <!-- 插画内置按钮区域的领取完成状态。 -->
          <button
            type="button"
            class="absolute left-1/2 -translate-x-1/2 border-0 bg-transparent p-0 text-center font-[700] text-[#CD1825]"
            :class="
              props.displayMode === 'pc'
                ? 'bottom-[90px] h-[53px] w-[280px] text-[32px] leading-[39px] [text-shadow:0_0.954px_0_#FFEEAB]  '
                : 'bottom-[63.67px] h-[38px] w-[160px] text-[23px] leading-[28px] [text-shadow:0_0.67px_0_#FFEEAB]   '
            "
            @click="$emit('close')"
          >
            {{ t('chatPublic.claimed') }}
          </button>

          <!-- 余额到账提示。 -->
          <p
            class="absolute left-1/2 -translate-x-1/2 text-center text-[#FFD59E]"
            :class="
              props.displayMode === 'pc'
                ? 'bottom-[24px] h-[38px] w-[247px] text-[16px] leading-[19px]'
                : 'bottom-[15.33px] h-[29.33px] w-[185.33px] text-[12px] leading-[14.67px]'
            "
          >
            {{ t('chatPublic.redPacketCredited') }}
          </p>
        </section>

        <!-- 关闭领取成功弹窗。 -->
        <button
          type="button"
          :aria-label="t('chatPublic.close')"
          class="flex shrink-0 items-center justify-center"
          :class="props.displayMode === 'pc' ? 'size-[40px]' : 'size-[25px]'"
          @click="$emit('close')"
        >
          <redPacketClose aria-hidden="true" class="size-full" />
        </button>
      </div>
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
