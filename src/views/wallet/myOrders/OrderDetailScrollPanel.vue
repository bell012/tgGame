<template>
  <!-- H5 详情滚动区域 -->
  <div :class="props.mode === 'pc' ? 'w-full px-4' : 'flex-1 overflow-y-auto bg-bg-1'">
    <!-- H5 详情内容区域 -->
    <div
      :class="
        props.mode === 'pc' ? 'flex w-full items-start justify-center' : 'px-3.5 pb-3.5 pt-3.5'
      "
    >
      <!-- H5 详情卡片 -->
      <section
        class="flex flex-col items-center rounded-lg bg-bg-2 px-0"
        :class="
          props.mode === 'pc'
            ? 'w-[448px] gap-8 pt-8 pb-4'
            : 'w-full gap-[30px] px-3.5 pt-[30px] pb-3.5'
        "
      >
        <!-- H5 详情顶部金额区域 -->
        <div class="flex flex-col items-center gap-2">
          <!-- H5 详情顶部金额展示 -->
          <div
            class="flex items-center"
            :class="props.mode === 'pc' ? 'gap-[0.36px]' : 'gap-[0.67px]'"
          >
            <!-- H5 详情顶部币种图标 -->
            <!-- <div
              class="flex items-center justify-center overflow-hidden rounded-full"
              :class="props.mode === 'pc' ? 'h-6 w-6' : 'h-5 w-5'"
            >
              <img :src="methodIcon" :alt="methodName" class="h-full w-full object-cover" />
            </div> -->

            <!-- H5 详情顶部币种符号 -->
            <span
              class="font-[700] text-text-1"
              :class="
                props.mode === 'pc' ? 'text-2xl leading-[29px]' : 'text-[25px] leading-[30px]'
              "
            >
              {{ heroCurrencySymbol }}
            </span>

            <!-- H5 详情顶部金额文本 -->
            <span
              class="font-[700] text-text-1"
              :class="
                props.mode === 'pc' ? 'text-2xl leading-[29px]' : 'text-[25px] leading-[30px]'
              "
            >
              {{ formatHeroAmount(Number(props.order.busiAmount ?? 0)) }}
            </span>
          </div>

          <!-- H5 详情顶部标题 -->
          <p
            class="text-text-1"
            :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
          >
            {{ amountTitle }}
          </p>
        </div>

        <!-- H5 详情信息面板 -->
        <div
          class="rounded-lg bg-bg-4"
          :class="props.mode === 'pc' ? 'w-[416px] px-5 py-4' : 'w-full px-3.5 py-3.5'"
        >
          <!-- H5 详情币种行 -->
          <div
            class="flex items-center justify-between"
            :class="props.mode === 'pc' ? 'py-2' : 'py-1.5'"
          >
            <span
              class="text-text-3"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{ t('deposit.order_currency') }}
            </span>
            <span
              class="text-text-1"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{ props.order.currency }}
            </span>
          </div>

          <!-- H5 详情支付金额行 -->
          <div
            class="flex items-center justify-between"
            :class="props.mode === 'pc' ? 'py-2' : 'py-1.5'"
          >
            <span
              class="text-text-3"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{ amountTitle }}
            </span>
            <span
              class="text-text-1"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{
                formatAmountWithoutSymbol(Number(props.order.busiAmount ?? 0), props.order.currency)
              }}
            </span>
          </div>

          <!-- H5 详情优惠金额行 -->
          <div
            v-if="showBonus"
            class="flex items-center justify-between"
            :class="props.mode === 'pc' ? 'py-2' : 'py-1.5'"
          >
            <span
              class="text-text-3"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{ bonusTitle }}
            </span>
            <span
              class="text-text-1"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{
                formatAmountWithoutSymbol(
                  Number(props.order.otherAmount ?? 0),
                  props.order.currency
                )
              }}
            </span>
          </div>

          <!-- H5 详情状态行 -->
          <div
            class="flex items-center justify-between"
            :class="props.mode === 'pc' ? 'py-2' : 'py-1.5'"
          >
            <span
              class="text-text-3"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{ t('deposit.order_status') }}
            </span>
            <span
              :class="[
                props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]',
                statusClass
              ]"
            >
              {{ statusText }}
            </span>
          </div>

          <!-- H5 详情订单号行 -->
          <div
            class="flex items-center justify-between"
            :class="props.mode === 'pc' ? 'py-2' : 'py-1.5'"
          >
            <span
              class="text-text-3"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{ t('deposit.order_no') }}
            </span>

            <!-- H5 详情订单号操作区 -->
            <div class="flex items-center" :class="props.mode === 'pc' ? 'gap-2' : 'gap-[5px]'">
              <span
                class="text-text-1"
                :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
              >
                {{ props.order.orderId }}
              </span>

              <!-- H5 详情复制按钮 -->
              <button
                type="button"
                class="flex items-center justify-center text-text-2"
                :class="props.mode === 'pc' ? 'h-6 w-6' : 'h-4 w-4'"
                @click="emit('copy-order-no', props.order.orderId)"
              >
                <CopyIcon :class="props.mode === 'pc' ? 'h-6 w-6' : 'h-4 w-4'" />
              </button>
            </div>
          </div>

          <!-- H5 详情创建时间行 -->
          <div
            class="flex items-center justify-between"
            :class="props.mode === 'pc' ? 'py-2' : 'py-1.5'"
          >
            <span
              class="text-text-3"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{ t('deposit.order_created_at') }}
            </span>
            <span
              class="text-text-1"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{ createdAt }}
            </span>
          </div>

          <!-- H5 详情方式行 -->
          <div
            class="flex items-center justify-between"
            :class="props.mode === 'pc' ? 'py-2' : 'py-1.5'"
          >
            <span
              class="text-text-3"
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
            >
              {{ methodTitle }}
            </span>

            <!-- H5 详情方式内容区 -->
            <div class="flex items-center" :class="props.mode === 'pc' ? 'gap-2' : 'gap-[5px]'">
              <div class="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full">
                <img :src="methodIcon" :alt="methodName" class="h-full w-full object-cover" />
              </div>
              <span
                class="text-text-1"
                :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-sm leading-[17px]'"
              >
                {{ methodName }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QueryMemberPayOrderPageRecord } from '@/api/interface/wallet'
import CopyIcon from '@/static/svg/copy.svg?component'
import { getCurrencySymbol } from '@/utils/locale'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  formatMyOrderTime,
  formatOrderAmount,
  getMyOrderStatusClass,
  getMyOrderStatusText,
  getMyOrderTypeIcon,
  getMyOrderTypeLabel,
  type OrderTypeIconMap,
  type OrderTab
} from './shared'

interface Props {
  order: QueryMemberPayOrderPageRecord
  tab: OrderTab
  mode?: 'mobile' | 'pc'
  orderTypeIconMap?: OrderTypeIconMap
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'mobile'
})

const emit = defineEmits<{
  'copy-order-no': [orderNo: string]
}>()

const { t, locale } = useI18n()

const amountTitle = computed(() =>
  props.tab === 'deposits'
    ? t('wallet.myOrdersPage.depositAmount')
    : t('wallet.myOrdersPage.withdrawalAmount')
)
const bonusTitle = computed(() =>
  props.tab === 'deposits'
    ? t('wallet.myOrdersPage.depositBonus')
    : t('wallet.myOrdersPage.withdrawalBonus')
)
const methodTitle = computed(() =>
  props.tab === 'deposits' ? t('deposit.order_deposit_method') : t('withdraw.withdraw_method')
)
const showBonus = computed(() => Number(props.order.otherAmount ?? 0) > 0)
const statusText = computed(() => getMyOrderStatusText(props.tab, props.order.status, t))
const statusClass = computed(() => getMyOrderStatusClass(props.tab, props.order.status))
const createdAt = computed(() => formatMyOrderTime(props.order.createTime))
const methodName = computed(() =>
  getMyOrderTypeLabel(props.order, String(locale.value || 'eng'), props.orderTypeIconMap ?? {})
)
const methodIcon = computed(() =>
  getMyOrderTypeIcon(props.order, String(locale.value || 'eng'), props.orderTypeIconMap ?? {})
)
const heroCurrencySymbol = computed(() => getCurrencySymbol(props.order.currency))

// 格式化页面展示金额（不含币种符号）
const formatAmountWithoutSymbol = (amount: number, currency: string) => {
  const formatted = formatOrderAmount(amount, currency)
  const symbol = getCurrencySymbol(currency)
  return formatted.startsWith(symbol) ? formatted.slice(symbol.length) : formatted
}

// 格式化详情顶部大金额
const formatHeroAmount = (amount: number) => String(amount)
</script>
