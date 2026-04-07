<template>
  <div class="fixed inset-0 overflow-y-auto bg-bg-1">
    <H5Header :title="t('personalCenter.leaveFeedfack')" />

    <div class="px-3.5 pb-8 pt-[20px]">
      <div class="rounded-[12px] bg-bg-2 p-4 text-sm text-text-1">
        {{ t('personalCenter.feedbackComingSoon') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'

const { t } = useI18n()
</script>
