<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header :title="t('withdraw.title')" showSort :rightIcon="DetailsIcon" />
      <div class="flex-1 min-h-0">
        <withdrawMobile class="h-full" />
      </div>
    </div>
    <WalletLayout v-else current-tab="withdraw">
      <div class="overflow-hidden">
        <withdrawDesktop />
      </div>
    </WalletLayout>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Header from '@/components/common/H5Header.vue'
import withdrawMobile from '@/components/withdraw/withdrawMobile.vue'
import withdrawDesktop from '@/components/withdraw/withdrawDesktop.vue'
import WalletLayout from '../index.vue'
import DetailsIcon from '@/static/svg/deposit/order-details.svg?component'

const { t } = useI18n()

const isMobile = useIsMobile()
</script>
<style scoped lang="scss"></style>
