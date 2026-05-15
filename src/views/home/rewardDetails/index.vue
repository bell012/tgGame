<template>
  <div class="min-h-screen bg-bg-1 text-[#f6fafc]">
    <H5Header
      v-if="isMobile"
      :title="t('rewardDetails.title')"
      :show-back="true"
      :disable-default-back="false"
      :fixed-top="true"
    />
    <Details />
  </div>
</template>
<script setup lang="ts">
import Details from './details.vue'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = useIsMobile()
</script>
<style lang="scss" scoped></style>
