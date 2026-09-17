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
        <DepositPageContent
          v-model="tabType"
          mode="mobile"
          class="h-full"
          :initial-method-code="initialMethodCode"
        />
      </div>
    </div>
    <PcLayout v-else v-model="tabType" :initial-method-code="initialMethodCode" />
  </div>
</template>

<script setup lang="ts">
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import DetailsIcon from '@/static/svg/deposit/record.svg?component'
import { navigateToName } from '@/utils/router'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DepositPageContent from './components/DepositPageContent.vue'
import PcLayout from './pc-layout.vue'
import type { DepositTabType } from './shared'

const { t } = useI18n()

const isMobile = useIsMobile()
const route = useRoute()
const tabType = ref<DepositTabType>('Crypto')

/** 读取任务中心充值跳转指定的法币或数字币页签。 */
const resolveTaskCenterDepositTab = (value: unknown): DepositTabType =>
  String(Array.isArray(value) ? value[0] : (value ?? '')).trim() === 'Fiat' ? 'Fiat' : 'Crypto'

/** 读取任务中心指定的支付方式编码，交由充值 Flow 精确预选。 */
const initialMethodCode = computed(() =>
  String(
    Array.isArray(route.query.taskCenterMethodCode)
      ? route.query.taskCenterMethodCode[0]
      : (route.query.taskCenterMethodCode ?? '')
  ).trim()
)

/** 路由携带任务中心充值意图时，使用后台已判定的页签。 */
watch(
  () => route.query.taskCenterTab,
  value => {
    tabType.value = resolveTaskCenterDepositTab(value)
  },
  { immediate: true }
)

const openDepositOrder = () => {
  void navigateToName('my-orders')
}
</script>

<style scoped lang="scss"></style>
