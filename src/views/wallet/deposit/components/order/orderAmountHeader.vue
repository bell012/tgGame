<template>
  <!-- 金额头部主容器 -->
  <div
    class="mx-auto flex w-full max-w-[352px] flex-col items-center gap-[5px] sm:gap-1 font-['Inter']"
    :class="wrapperClass"
  >
    <!-- 金额与币种区域 -->
    <div class="relative flex w-full items-baseline justify-center gap-[3px] isolate">
      <p
        class="shrink-0 whitespace-nowrap text-center text-[27px] sm:text-[40px] font-bold leading-normal text-text-1 capitalize"
      >
        {{ amount }}
      </p>
      <p
        class="shrink-0 whitespace-nowrap text-center text-[14px] sm:text-[18px] font-bold leading-normal text-text-2 sm:text-text-1 capitalize"
      >
        {{ method }}
      </p>
    </div>
    <!-- 汇率展示区域 -->
    <div
      v-if="displayRate"
      class="order-1 w-full grow-0 shrink-0 text-center font-['Inter'] text-[12px] sm:text-[16px] font-normal leading-normal text-text-2"
    >
      {{ displayRate }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    amount: string | number
    method: string
    rate?: string
    wrapperClass?: string
  }>(),
  {
    rate: '',
    wrapperClass: 'pt-3'
  }
)

// 格式化展示金额
const formatDisplayAmount = (value: number) => {
  if (!Number.isFinite(value)) return ''
  const fixed = value.toFixed(2)
  return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed
}

// 计算汇率文案
const displayRate = computed(() => {
  const rawRate = props.rate?.trim()
  if (!rawRate) return ''
  if (/^Rate[:：]/i.test(rawRate)) return rawRate

  const rateMatch = rawRate.match(/^1\s*([A-Za-z]+)\s*[≈~]\s*([0-9]+(?:\.[0-9]+)?)\s*([A-Za-z]+)$/)
  if (!rateMatch) return `Rate：${rawRate}`

  const [, , rateNumberText, toCurrency] = rateMatch
  const rateNumber = Number(rateNumberText)
  const amountNumber = Number(props.amount)
  if (!Number.isFinite(rateNumber) || !Number.isFinite(amountNumber)) {
    return `Rate：${rawRate}`
  }

  const youGetValue = formatDisplayAmount(amountNumber * rateNumber)
  if (!youGetValue) return `Rate：${rawRate}`
  return `Rate：${rawRate}（You Get≈${youGetValue}${toCurrency}）`
})
</script>
