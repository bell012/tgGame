<template>
  <div :class="isDesktop ? 'flex flex-col' : 'flex min-h-0 flex-1 flex-col overflow-y-auto p-3.5'">
    <section v-if="coverUrl">
      <img
        :src="coverUrl"
        :alt="pageTitle"
        class="w-full aspect-[375/180] object-cover"
        :class="isDesktop ? 'rounded-[24px]' : 'rounded-[10px]'"
      />
    </section>

    <template v-if="activity">
      <section
        class="flex items-center justify-center gap-3 text-theme-primary"
        :class="isDesktop ? 'px-6 pt-4' : 'pt-5'"
      >
        <div class="flex min-w-0 flex-1 justify-end">
          <SectionOrnament class="h-3 w-full max-w-[80px]" aria-hidden="true" />
        </div>
        <h2
          class="shrink-0 font-[700]"
          :class="isDesktop ? 'text-[31px] leading-[37px]' : 'text-lg leading-[22px]'"
        >
          {{ $t('activityPromotions.detailTitle') }}
        </h2>
        <div class="flex min-w-0 flex-1 justify-start">
          <SectionOrnament class="h-3 w-full max-w-[80px] scale-x-[-1]" aria-hidden="true" />
        </div>
      </section>

      <section :class="isDesktop ? 'px-6 pb-6 pt-4' : 'pt-[30px]'">
        <div
          v-if="descriptionHtml"
          class="promotion-detail-html text-sm leading-relaxed text-text-1"
          v-html="descriptionHtml"
        />
        <p
          v-else-if="descriptionText"
          class="text-sm leading-relaxed whitespace-pre-wrap text-text-1"
        >
          {{ descriptionText }}
        </p>
      </section>
    </template>

    <section
      v-else
      class="text-center text-sm text-text-2"
      :class="isDesktop ? 'px-6 py-16' : 'py-10'"
    >
      {{ $t('activityPromotions.notFound') }}
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityListItem } from '@/api/interface/activity'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import SectionOrnament from '@/static/svg/activity/promotion-detail-section-ornament.svg?component'
import { getActivityRuleDesc, getActivityTitle, toPromotionImageUrl } from '../shared'

const props = withDefaults(
  defineProps<{
    activity: ActivityListItem | null
    variant?: 'mobile' | 'desktop'
  }>(),
  {
    variant: 'mobile'
  }
)

const isDesktop = computed(() => props.variant === 'desktop')
const { currentCurrencyCode } = useDisplayCurrency()

const coverUrl = computed(() => toPromotionImageUrl(props.activity?.preImage))

const pageTitle = computed(() => {
  if (!props.activity) {
    return ''
  }
  return getActivityTitle(props.activity)
})

const descriptionRaw = computed(() => {
  if (!props.activity) {
    return ''
  }
  return getActivityRuleDesc(props.activity, currentCurrencyCode.value) || ''
})

const isHtmlDescription = computed(() => {
  const text = descriptionRaw.value
  return text.includes('<') && text.includes('>')
})

const descriptionHtml = computed(() => (isHtmlDescription.value ? descriptionRaw.value : ''))
const descriptionText = computed(() => (isHtmlDescription.value ? '' : descriptionRaw.value))
</script>

<style scoped>
.promotion-detail-html :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
