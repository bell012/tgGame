<template>
  <div
    v-if="props.variant === 'mobile'"
    class="flex h-[65px] items-center gap-2 rounded-lg bg-opacity-30 px-2"
  >
    <img :src="promoCardImage" alt="" class="h-[49px] w-[45px] shrink-0 object-contain" />

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-[700] leading-tight text-text-1">
        {{ t('rewardCenter.popup.promoTitle') }}
      </p>
      <p class="mt-0.5 truncate text-xs font-medium leading-tight text-text-2">
        {{ t('rewardCenter.popup.promoDesc') }}
      </p>
    </div>

    <button
      type="button"
      class="btn-primary flex h-[35px] min-w-[70px] shrink-0 items-center justify-center rounded-lg px-2 text-sm font-[700]"
      @click="$emit('deposit')"
    >
      {{ t('deposit.title') }}
    </button>
  </div>

  <div v-else class="relative rounded-lg bg-bg-3">
    <span
      class="reward-claim-promo-badge absolute left-0 top-0 rounded-tl-lg rounded-br-lg px-2 py-0.5 text-[10px] font-normal leading-none text-text-1"
    >
      {{ t('rewardCenter.popup.newUserOnly') }}
    </span>

    <div class="flex items-center justify-between gap-3 px-3 pb-3 pt-4">
      <div class="min-w-0 flex-1">
        <p class="truncate text-base font-[700] leading-tight text-text-1">
          {{ t('rewardCenter.popup.promoTitle') }}
        </p>
        <p class="mt-2 truncate text-sm font-normal leading-tight text-text-2">
          {{ t('rewardCenter.popup.promoDesc') }}
        </p>
      </div>

      <button
        type="button"
        class="btn-primary flex h-10 w-20 shrink-0 items-center justify-center rounded-lg text-sm font-[700]"
        @click="$emit('deposit')"
      >
        {{ t('deposit.title') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import promoCardImage from '@/static/img/reward-center/popup-promo-card.webp'

const props = withDefaults(
  defineProps<{
    variant?: 'mobile' | 'desktop'
  }>(),
  {
    variant: 'mobile'
  }
)

defineEmits<{
  deposit: []
}>()

const { t } = useI18n()
</script>

<style scoped lang="scss">
.reward-claim-promo-badge {
  background: linear-gradient(90deg, #ffcb22 0%, #fa8c2b 100%);
}
</style>
