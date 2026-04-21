<template>
  <div>
    <section
      v-if="isMobile"
      class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1"
    >
      <H5Header
        :title="t('withdraw.title')"
        showSort
        :rightIcon="DetailsIcon"
        @sort="openWithdrawOrder"
      />
      <div class="flex-1 min-h-0">
        <MobileLayout />
      </div>
    </section>
    <WalletLayout v-else current-tab="withdraw">
      <div class="overflow-hidden">
        <DesktopLayout />
      </div>
    </WalletLayout>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateToName } from '@/utils/router'
import H5Header from '@/components/common/H5Header.vue'
import WalletLayout from '../index.vue'
import MobileLayout from './mobile-layout.vue'
import DesktopLayout from './desktop-layout.vue'
import DetailsIcon from '@/static/svg/deposit/record.svg?component'

const { t } = useI18n()
const isMobile = useIsMobile()

const openWithdrawOrder = () => {
  void navigateToName('my-orders')
}
</script>
<style scoped lang="scss"></style>
