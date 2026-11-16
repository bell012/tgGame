<!-- 快捷投注设置 -->
<template>
  <section
    class="border border-opacity-10"
    :class="
      variant === 'pc'
        ? 'rounded-[12px] bg-bg-2 p-[16px]'
        : 'rounded-[10px] bg-bg-2 px-[12px] py-[12px]'
    "
    role="dialog"
    aria-labelledby="hash-game-quick-bet-title"
    :aria-label="t('hashGame.quickBet')"
  >
    <div class="flex items-center justify-between">
      <h2
        id="hash-game-quick-bet-title"
        class="font-[400] text-text-1"
        :class="variant === 'pc' ? 'text-[16px]' : 'text-[14px]'"
      >
        {{ t('hashGame.quickBet') }}
      </h2>
      <button
        type="button"
        role="switch"
        class="relative shrink-0 rounded-full transition-colors"
        :class="[
          variant === 'pc' ? 'h-[20px] w-[40px] p-[3px]' : 'h-[20px] w-[40px] p-[3px]',
          enabled ? 'bg-theme-primary' : 'bg-opacity-6'
        ]"
        :aria-checked="enabled"
        :aria-label="t('hashGame.quickBet')"
        @click="$emit('toggle')"
      >
        <span
          class="block rounded-full bg-common-100 transition-transform"
          :class="
            variant === 'pc'
              ? enabled
                ? 'size-[15px] translate-x-[18px]'
                : 'size-[15px] translate-x-[2px]'
              : enabled
                ? 'size-[15px] translate-x-[18px]'
                : 'size-[15px] translate-x-[2px]'
          "
        />
      </button>
    </div>
    <p class="mt-[8px] text-text-2" :class="variant === 'pc' ? 'text-[12px]' : 'text-[10px]'">
      {{ t('hashGame.quickBetHint') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{ enabled: boolean; variant?: 'h5' | 'pc' }>(), { variant: 'h5' })
defineEmits<{ toggle: [] }>()

// 快捷投注文案跟随当前语言设置。
const { t } = useI18n()
</script>
