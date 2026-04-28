<template>
  <div class="mt-3 grid grid-cols-2" :class="isMobile ? 'gap-2.5' : 'gap-3'">
    <button
      type="button"
      :class="buttonClass(activeTab === 'records')"
      @click="$emit('open-records')"
    >
      {{ t('rebatePage.actionTabs.records') }}
    </button>

    <button
      type="button"
      :class="buttonClass(activeTab === 'rules', true)"
      @click="$emit('open-rules')"
    >
      <span>{{ t('rebatePage.actionTabs.rules') }}</span>
      <ExplainIcon class="h-3.5 w-3.5 opacity-80" />
    </button>
  </div>
</template>

<script setup lang="ts">
import ExplainIcon from '@/static/svg/vip/explain.svg?component'
import { useI18n } from 'vue-i18n'
import type { RebateTab } from '../../types'

const { t } = useI18n()

const props = defineProps<{
  activeTab: RebateTab
  isMobile: boolean
}>()

defineEmits<{
  'open-records': []
  'open-rules': []
}>()

const buttonClass = (_isActive: boolean, withIcon = false) => {
  const baseClass = props.isMobile
    ? withIcon
      ? 'inline-flex h-[44px] items-center justify-center gap-1 rounded-[12px] text-[16px] font-[500]'
      : 'h-[44px] rounded-[12px] text-[16px] font-[500]'
    : withIcon
      ? 'inline-flex h-[44px] items-center justify-center gap-1 rounded-[10px] text-sm font-[600]'
      : 'h-[44px] rounded-[10px] text-sm font-[600]'

  const stateClass = 'bg-bg-2 text-text-2 border border-transparent'

  return `${baseClass} ${stateClass}`
}
</script>

<style scoped lang="scss"></style>
