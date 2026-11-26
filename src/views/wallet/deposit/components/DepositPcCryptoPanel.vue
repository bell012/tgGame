<template>
  <DepositPcCryptoSkeleton v-if="isInitialLoading" />

  <!-- 数字币充值面板外层容器 -->
  <div v-else-if="payMethods.length > 0" class="w-full rounded-xl bg-bg-2 p-6 font-['Inter']">
    <!-- 数字币充值面板主体内容 -->
    <div class="flex flex-col gap-6">
      <!-- 币种按钮列表 -->
      <div
        ref="coinListRef"
        class="flex items-center gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        @wheel.prevent="handleCoinWheel"
      >
        <!-- 单个币种按钮 -->
        <button
          v-for="coin in coinOptions"
          :key="coin.columnCode"
          type="button"
          class="flex h-9 shrink-0 items-center rounded-full px-6 text-sm font-bold leading-[17px] transition-colors"
          :class="
            coin.columnCode === selectedMethod?.columnCode
              ? 'bg-theme-primary text-text-4'
              : 'bg-bg-3 text-text-3 lg:hover:bg-theme-3'
          "
          @click.stop="selectMethod(coin.columnCode)"
        >
          <img v-if="coin.icon" class="mr-2 h-5 w-5 shrink-0" :src="coin.icon" :alt="coin.label" />
          <span class="whitespace-nowrap">{{ coin.label }}</span>
        </button>
      </div>

      <!-- 充值渠道区域 -->
      <div v-if="showChannelSection" class="flex flex-col gap-2">
        <!-- 充值渠道标题 -->
        <p class="text-sm font-bold leading-[17px] text-text-1">
          {{ t('deposit.deposit_channel') }}
        </p>

        <!-- 充值渠道按钮列表 -->
        <div class="grid grid-cols-6 gap-4">
          <!-- 单个充值渠道按钮 -->
          <button
            v-for="channel in channelOptions"
            :key="channel.rowId"
            type="button"
            class="relative flex h-9 items-center justify-center rounded-lg border px-3 text-center text-sm leading-5 transition-colors"
            :class="[
              'text-text-1 lg:hover:bg-theme-3',
              selectedSubColumn?.rowId === channel.rowId
                ? 'border border-theme-primary bg-theme-3'
                : ''
            ]"
            :style="{
              border: `1px solid ${selectedSubColumn?.rowId === channel.rowId ? 'var(--color-theme-level-1)' : 'var(--color-opacity-10)'}`
            }"
            @click="selectChannel(channel.rowId)"
          >
            <DepositBonusBadge
              v-if="channel.bonusRatio > 0"
              :ratio="channel.bonusRatio"
              class="-top-[5px] right-[6px]"
            />
            {{ channel.label }}
          </button>
        </div>
      </div>

      <!-- 充值金额与流水信息区域 -->
      <div class="flex flex-col gap-4">
        <!-- 充值金额输入区域 -->
        <div class="flex flex-col gap-2">
          <!-- 充值金额标题与教程入口 -->
          <div class="flex items-center justify-between gap-4">
            <!-- 充值金额标题 -->
            <p class="text-sm font-bold leading-[17px] text-text-1">
              {{ t('deposit.deposit_amount') }}
            </p>

            <!-- 充值教程按钮 -->
            <button
              type="button"
              class="flex items-center gap-1 text-sm leading-5 text-text-2 transition-colors lg:hover:text-text-1"
              @click="showUnavailableToast"
            >
              <AmountInfoIcon class="h-4 w-4 shrink-0" />
              <span>{{ t('deposit.how_to_deposit') }}</span>
            </button>
          </div>

          <!-- 充值金额输入框容器 -->
          <div
            class="flex h-12 items-center rounded-lg border border-opacity-10 bg-input-3 px-3 transition-colors focus-within:border-theme-primary"
          >
            <img
              v-if="selectedCoinIcon"
              class="mr-2 h-6 w-6 shrink-0 rounded-full"
              :src="selectedCoinIcon"
              alt=""
            />
            <DepositTokenIcon v-else class="mr-2 h-6 w-6 shrink-0 text-theme-primary" />

            <!-- 充值金额输入框 -->
            <input
              v-model.number="amount"
              type="number"
              :readonly="!isManualAmountAllowed"
              :inputmode="isManualAmountAllowed ? 'decimal' : 'none'"
              :placeholder="amountPlaceholder"
              class="min-w-0 flex-1 bg-transparent text-sm leading-5 text-text-1 outline-none placeholder:text-sm placeholder:text-text-3"
              :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
            />

            <!-- 清空金额按钮 -->
            <button
              v-show="!isDepositDisabled"
              type="button"
              class="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-opacity-10"
              @click="clearAmount"
            >
              <CloseIcon class="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        <!-- 流水选项与提示区域 -->
        <div class="flex flex-col gap-2">
          <!-- 流水选项切换容器 -->
          <div v-if="showWageringSection" class="border-b border-opacity-10 pb-2">
            <!-- 流水选项列表 -->
            <div class="flex items-center gap-6 pt-[10px]">
              <!-- 区块：template -->
              <template v-for="(item, index) in wageringOptions" :key="item.rowId">
                <!-- 单个流水选项按钮 -->
                <button
                  type="button"
                  class="relative pb-1 text-sm leading-5 transition-colors"
                  :class="
                    selectedDiscountItem?.rowId === item.rowId
                      ? 'font-bold text-text-1'
                      : 'text-text-2 lg:hover:text-text-1'
                  "
                  @click="selectWagering(item.rowId)"
                >
                  {{ item.label }}
                  <DepositBonusBadge
                    v-if="item.ratio > 0"
                    :ratio="item.ratio"
                    class="-right-4 -top-[9px]"
                  />
                  <span
                    v-if="selectedDiscountItem?.rowId === item.rowId"
                    class="absolute inset-x-0 -bottom-[9px] h-px bg-theme-primary"
                  ></span>
                </button>

                <!-- 流水选项分隔线 -->
                <div
                  v-if="index !== wageringOptions.length - 1"
                  class="h-[14px] w-px bg-opacity-10"
                ></div>
              </template>
            </div>
          </div>

          <!-- 提款流水提示文案 -->
          <p class="text-xs leading-[15px] text-secondary-7">
            {{ t('deposit.withdrawal_no_wagering_tip') }}
          </p>
        </div>

        <!-- 预设金额区域 -->
        <div class="mt-4 w-full relative">
          <!-- 预设金额按钮网格 -->
          <div
            ref="presetsRef"
            class="grid grid-cols-6 gap-2 p-2 bg-bg-4 transition-all duration-300"
            :class="[
              canExpand ? 'rounded-tl-lg rounded-tr-lg' : 'rounded-lg',
              expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[104px] overflow-hidden'
            ]"
          >
            <!-- 单个预设金额按钮 -->
            <button
              v-for="preset in presetAmounts"
              :key="preset"
              type="button"
              class="relative flex h-10 items-center justify-center rounded-lg text-base font-bold leading-[19px] transition-colors lg:hover:bg-theme-primary"
              :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
              @click="selectPresetAmount(preset)"
            >
              <!-- 预设金额文本 -->
              <span>{{ preset }}</span>
            </button>
          </div>

          <!-- 展开与收起控制区域 -->
          <div v-if="canExpand" class="mt-2 flex justify-center">
            <!-- 展开与收起按钮 -->
            <button
              type="button"
              class="flex items-center gap-2 text-[13px] leading-4 text-text-3 transition-colors lg:hover:text-text-1"
              @click="expanded = !expanded"
            >
              <span>{{ expanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}</span>
              <ExpandUpDoubleIcon v-if="expanded" class="h-2 w-[9px]" />
              <ExpandDownDoubleIcon v-else class="h-2 w-[9px]" />
            </button>
          </div>
        </div>
      </div>

      <!-- 立即充值按钮 -->
      <button
        class="flex h-12 w-full items-center justify-center rounded-lg text-sm font-extrabold text-text-4"
        :class="[!isDepositDisabled ? 'btn-primary' : 'cursor-not-allowed bg-theme-2']"
        :disabled="isDepositDisabled"
        @click="doDeposit"
      >
        {{ t('deposit.deposit_now') }}
      </button>

      <!-- 钱包快捷入口按钮 -->
      <button
        type="button"
        class="flex items-center justify-center gap-2 text-sm leading-5 text-text-1"
        @click="loadWallet"
      >
        <span>{{ t('deposit.load_from_wallet') }}</span>
        <span class="flex items-center gap-1">
          <img class="h-6" :src="groupIcon" :alt="t('deposit.wallet_bonus_alt')" />
          <span class="text-[13px] leading-4">+300</span>
        </span>
      </button>
    </div>
  </div>

  <ThemedEmptyState
    v-else
    :dark-image="defaultImgDark"
    :light-image="defaultImgLight"
    :image-alt="$t('notifications.title')"
    :message="$t('notifications.transactionsEmptyMessage')"
    text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
  />

  <!-- 充值订单弹窗组件 -->
  <depositCryptoOrderPop
    ref="orderPopup"
    :embedded="embedded"
    :teleport-target="teleportTarget"
    v-model:model-value="orderPopShow"
    v-model:orderInfo="orderInfo"
    @close="handleClose"
    @hidden="handleHidden"
  />
</template>

<script setup lang="ts">
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import groupIcon from '@/static/img/crypto/groupIcons.png'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import CloseIcon from '@/static/svg/close.svg?component'
import AmountInfoIcon from '@/static/svg/deposit/amount-info.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/deposit-token.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepositCryptoFlow } from '../shared'
import DepositPcCryptoSkeleton from './DepositPcCryptoSkeleton.vue'
import depositCryptoOrderPop from './order/crypto/depositCryptoOrderPop.vue'
import DepositBonusBadge from './shared/DepositBonusBadge.vue'
import { usePresetGrid } from './shared/usePresetGrid'

const { t } = useI18n()

const props = defineProps<{
  initialMethodCode?: string
  embedded?: boolean
  teleportTarget?: HTMLElement | null
}>()

const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const {
  isInitialLoading,
  payMethods,
  selectedMethod,
  selectedSubColumn,
  selectedDiscountItem,
  amount,
  orderPopShow,
  orderInfo,
  presetAmounts,
  coinOptions,
  selectedCoinIcon,
  channelOptions,
  wageringOptions,
  showChannelSection,
  showWageringSection,
  isManualAmountAllowed,
  amountPlaceholder,
  isDepositDisabled,
  showUnavailableToast,
  selectMethod,
  clearAmount,
  selectChannel,
  selectWagering,
  selectPresetAmount,
  loadWallet,
  doDeposit,
  handleClose,
  handleHidden
} = useDepositCryptoFlow({
  isMobile: false,
  initialMethodCode: props.initialMethodCode,
  emitHidden: value => emit('hidden', value),
  emitHiddenOnOrderOpen: false,
  emitHiddenOnOrderHidden: false
})

const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded, canExpand } = usePresetGrid(presetsRef, presetAmounts, 6)

const coinListRef = ref<HTMLDivElement | null>(null)

// 鼠标竖向滚轮转为币种列表横向滚动
const handleCoinWheel = (event: WheelEvent) => {
  coinListRef.value?.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

const orderPopup = ref<InstanceType<typeof depositCryptoOrderPop>>()
defineExpose({ back: () => orderPopup.value?.back() ?? false })
</script>

<style scoped lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  appearance: textfield;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
}
</style>
