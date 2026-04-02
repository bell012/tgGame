<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header :title="t('deposit.title')" showSort :rightIcon="DetailsIcon" />
      <div class="flex-1 min-h-0">
        <depositContentPanel v-model="tabType" class="h-full" />
      </div>
    </div>
    <WalletLayout v-else current-tab="deposit">
      <div class="overflow-hidden">
        <personalCenterDepositContentPanel />
      </div>
    </WalletLayout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Header from '@/components/common/H5Header.vue'
import depositContentPanel, {
  type DepositTabType
} from '@/components/deposit/deposit/depositContentPanel.vue'
import personalCenterDepositContentPanel from '@/components/deposit/deposit/personalCenterDepositContentPanel.vue'
import WalletLayout from '../index.vue'
import DetailsIcon from '@/static/svg/deposit/record.svg?component'

const { t } = useI18n()

const isMobile = useIsMobile()
const tabType = ref<DepositTabType>('Crypto')
</script>

<style scoped lang="scss"></style>
