<template>
  <section class="fixed inset-0 overflow-hidden bg-bg-1">
    <div class="flex h-full flex-col bg-bg-1" style="font-family: Inter, avertastd, sans-serif">
      <H5Header
        :title="t('rebatePage.records.title')"
        :show-sort="true"
        :right-icon="supportHeaderIcon"
        @sort="handleSupportClick"
      />

      <main
        class="records-page-scroll min-h-0 flex-1 overflow-y-auto scrollbar-none px-[14px] pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[14px]"
      >
        <RebateRecordsContent />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import H5Header from '@/components/common/H5Header.vue'
import { useOnlineCustomerService } from '@/composables/useOnlineCustomerService'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { useI18n } from 'vue-i18n'
import RebateRecordsContent from '../components/records/RebateRecordsContent.vue'

const { t } = useI18n()
const supportHeaderIcon = CustomerServiceIcon
const { open: openOnlineCustomer } = useOnlineCustomerService()

/** 打开在线客服入口，根据后台配置进入第三方客服或原生客服页。 */
const handleSupportClick = () => {
  openOnlineCustomer()
}
</script>

<style scoped lang="scss">
.records-page-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}
</style>
