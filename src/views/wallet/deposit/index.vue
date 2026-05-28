<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header
        :title="t('deposit.title')"
        showSort
        :rightIcon="DetailsIcon"
        @sort="openDepositOrder"
      />
      <div class="flex-1 min-h-0">
        <DepositPageContent v-model="tabType" mode="mobile" class="h-full" />
      </div>
    </div>
    <PcLayout v-else v-model="tabType" />
  </div>
</template>

<script setup lang="ts">
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import DetailsIcon from '@/static/svg/deposit/record.svg?component'
import { navigateToName } from '@/utils/router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DepositPageContent from './components/DepositPageContent.vue'
import PcLayout from './pc-layout.vue'
import type { DepositTabType } from './shared'

const { t } = useI18n()

const isMobile = useIsMobile()
const tabType = ref<DepositTabType>('Crypto')

const openDepositOrder = () => {
  void navigateToName('my-orders')
}
</script>

<style scoped lang="scss"></style>
