<template>
  <div>
    <div v-if="isMobile">
      <H5Header :title="t('withdraw.title')" showSort>
        <template #right>
          <DetailsIcon class="w-4 h-4 text-icon-1" />
        </template>
      </H5Header>
      <withdrawMobile />
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
