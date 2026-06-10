<template>
  <DepositPcFiatSkeleton v-if="isInitialLoading" />

  <!-- 法币充值面板容器 -->
  <div v-else-if="payMethods.length > 0" class="w-full bg-bg-2 p-6 rounded-lg font-['Inter']">
    <!-- 支付方式标题 -->
    <p class="text-sm font-bold leading-normal text-text-1">{{ t('deposit.methods') }}</p>
    <!-- 支付方式列表外层容器 -->
    <div class="mt-2.5 overflow-hidden">
      <!-- 支付方式横向滚动容器 -->
      <div
        ref="methodListRef"
        class="flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
        @wheel.prevent="handleMethodListWheel"
      >
        <!-- 单个支付方式卡片 -->
        <div
          class="shrink-0 basis-[calc((100%-3rem)/4)] flex items-center justify-center p-4 rounded-xl lg:hover:bg-theme-3 lg:hover:border-theme-primary"
          :class="{
            'border border-theme-primary bg-theme-3':
              selectedMethod?.columnCode === item.columnCode,
            'border border-transparent bg-bg-4': selectedMethod?.columnCode !== item.columnCode
          }"
          v-for="(item, index) in payMethods"
          :key="item.columnCode"
          :ref="el => setMethodItemRef(el, index)"
          @click.stop="selectMethod(item, index)"
        >
          <!-- 支付方式图标 -->
          <img class="mr-4 h-6" :src="resolveMethodIcon(item)" />
          <!-- 支付方式名称 -->
          <p class="text-base font-bold leading-normal text-text-1">{{ item.columnName }}</p>
        </div>
      </div>
    </div>
    <!-- 充值渠道区域 -->
    <div v-if="showChannelSection" class="mt-4 flex flex-col gap-2">
      <!-- 充值渠道标题 -->
      <p class="text-sm font-bold leading-normal text-text-1">
        {{ t('deposit.deposit_channel') }}
      </p>
      <!-- 充值渠道按钮列表 -->
      <div class="grid grid-cols-6 gap-4">
        <!-- 单个充值渠道按钮 -->
        <button
          v-for="channel in channelOptions"
          :key="channel.rowId"
          type="button"
          class="flex h-9 items-center justify-center rounded-lg border px-3 text-center text-sm leading-5 transition-colors"
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
          {{ channel.label }}
        </button>
      </div>
    </div>

    <!-- 充值金额标题 -->
    <p class="mt-4 text-sm font-bold leading-normal text-text-1">
      {{ t('deposit.deposit_amount') }}
    </p>
    <!-- 充值金额输入容器 -->
    <div
      class="flex items-center w-full mt-2 p-3 rounded-lg bg-input-3 border focus-within:border-[color:var(--color-theme-level-1)] focus-within:ring-0"
      :class="
        isAmountInputHighlighted
          ? 'border-[color:var(--color-theme-level-1)]'
          : 'border-[color:var(--color-opacity-10)]'
      "
    >
      <DepositTokenIcon class="w-6 h-6 mr-3 text-theme-primary" />
      <!-- 充值金额输入框 -->
      <input
        type="number"
        v-model.number="amount"
        :readonly="!isManualAmountAllowed"
        :inputmode="isManualAmountAllowed ? 'decimal' : 'none'"
        :placeholder="amountPlaceholder"
        class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-sm"
        :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
      />
      <!-- 清空输入按钮 -->
      <button
        v-show="!isDepositDisabled"
        class="w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
        @click="clearAmount"
      >
        <CloseIcon class="h-2.5 w-2.5" />
      </button>
    </div>
    <!-- 流水选项与提示区域 -->
    <div class="mt-4 flex flex-col gap-2">
      <!-- 流水选项切换容器 -->
      <div class="border-b border-opacity-10 pb-2">
        <!-- 流水选项列表 -->
        <div class="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <template v-for="(item, index) in wageringOptions" :key="item.rowId">
            <!-- 单个流水选项按钮 -->
            <button
              type="button"
              class="relative shrink-0 pb-1 text-sm leading-5 transition-colors"
              :class="
                selectedDiscountItem?.rowId === item.rowId
                  ? 'font-bold text-text-1'
                  : 'text-text-2 lg:hover:text-text-1'
              "
              @click="selectWagering(item.rowId)"
            >
              {{ item.label }}
              <span
                v-if="selectedDiscountItem?.rowId === item.rowId"
                class="absolute inset-x-0 -bottom-[9px] h-px bg-theme-primary"
              ></span>
            </button>

            <!-- 流水选项分隔线 -->
            <div
              v-if="index !== wageringOptions.length - 1"
              class="h-[14px] w-px shrink-0 bg-opacity-10"
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
        class="grid grid-cols-6 gap-2 p-2 bg-bg-4 transition-all duration-300 rounded-tl-lg rounded-tr-lg"
        :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[104px] overflow-hidden'"
      >
        <!-- 单个预设金额按钮 -->
        <button
          v-for="preset in presetAmounts"
          :key="preset"
          @click="selectPresetAmount(preset)"
          class="relative flex h-10 items-center justify-center rounded-lg text-base font-bold leading-[19px] transition-colors lg:hover:bg-theme-primary"
          :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
        >
          <!-- 预设金额文本 -->
          <span>{{ preset }}</span>
          <!-- 预设金额优惠角标 -->
          <span
            v-if="presetDiscountRatioMap[preset] !== undefined"
            class="pointer-events-none absolute -right-1 -top-1 min-w-8 rounded-lg bg-center bg-contain bg-no-repeat px-2 py-0.5 text-center text-xs font-bold leading-4"
            :style="{ backgroundImage: `url(${addBonusBadgeBg})` }"
          >
            {{ t('deposit.bonus_label', { ratio: presetDiscountRatioMap[preset] }) }}
          </span>
        </button>
      </div>
      <!-- 展开收起操作区 -->
      <div class="w-full bg-bg-4 rounded-bl-lg rounded-br-lg py-2">
        <!-- 展开收起按钮 -->
        <button
          class="mx-auto flex items-center gap-1 text-xs text-text-3 lg:hover:text-text-1 transition"
          @click="expanded = !expanded"
        >
          {{ expanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}
          <ExpandUpDoubleIcon v-if="expanded" class="w-[9px] h-2" />
          <ExpandDownDoubleIcon v-else class="w-[9px] h-2" />
        </button>
      </div>
    </div>
    <!-- 立即充值按钮区域 -->
    <div class="w-full mt-4">
      <!-- 立即充值按钮 -->
      <button
        class="w-full py-4 lg:hover:btn-primary rounded-xl font-semibold text-text-4"
        :class="[!isDepositDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
        :disabled="isDepositDisabled"
        @click="doDeposit"
      >
        {{ t('deposit.deposit_now') }}
      </button>
    </div>
  </div>
  <!-- 空状态 -->
  <ThemedEmptyState
    v-else-if="payColumnLoaded"
    :dark-image="defaultImgDark"
    :light-image="defaultImgLight"
    :image-alt="$t('notifications.title')"
    :message="$t('notifications.emptyMessage')"
    text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
  />
  <!-- 充值订单弹窗 -->
  <depositFiatOrderPop
    v-model:model-value="orderPopShow"
    v-model:orderInfo="orderInfo"
    @close="handleClose"
    @hidden="handleHidden"
  />
</template>
<script setup lang="ts">
import type { QueryPayColumnItem } from '@/api/interface/wallet'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import addBonusBadgeBg from '@/static/img/deposit/add-bonus-badge.png'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import CloseIcon from '@/static/svg/close.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import DepositTokenIcon from '@/static/svg/deposit/fiat-order-amount.svg?component'
import { nextTick, ref, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepositFiatFlow } from '../shared'
import DepositPcFiatSkeleton from './DepositPcFiatSkeleton.vue'
import depositFiatOrderPop from './order/fiat/depositFiatOrderPop.vue'
import { usePresetGrid } from './shared/usePresetGrid'

const { t } = useI18n()

const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const {
  isInitialLoading,
  presetAmounts,
  payMethods,
  selectedMethod,
  selectedSubColumn,
  selectedDiscountItem,
  amount,
  orderInfo,
  orderPopShow,
  payColumnLoaded,
  isDepositDisabled,
  showChannelSection,
  isManualAmountAllowed,
  presetDiscountRatioMap,
  channelOptions,
  wageringOptions,
  amountPlaceholder,
  isAmountInputHighlighted,
  clearAmount,
  selectPresetAmount,
  resolveMethodIcon,
  selectWagering,
  selectChannel,
  selectMethod: selectDepositMethod,
  doDeposit,
  handleClose,
  handleHidden
} = useDepositFiatFlow({
  isMobile: false,
  emitHidden: value => emit('hidden', value),
  emitHiddenOnOrderOpen: false,
  emitHiddenOnOrderHidden: false
})

const methodListRef = ref<HTMLDivElement | null>(null)
const methodItemRefs = ref<Array<HTMLElement | null>>([])
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)

// 记录支付方式项的 DOM 引用
const setMethodItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  const target =
    el instanceof HTMLElement
      ? el
      : el && '$el' in el && el.$el instanceof HTMLElement
        ? el.$el
        : null

  methodItemRefs.value[index] = target
}

// 滚动到指定支付方式项
const scrollMethodIntoView = async (index: number) => {
  await nextTick()

  const target = methodItemRefs.value[index]
  if (!target || !methodListRef.value) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

// 处理支付方式列表的滚轮横向滚动
const handleMethodListWheel = (event: WheelEvent) => {
  if (!methodListRef.value) return

  methodListRef.value.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

// 选择支付方式并切换对应子栏目数据
const selectMethod = async (method: QueryPayColumnItem, index: number) => {
  if (selectedMethod.value?.columnCode === method.columnCode) {
    void scrollMethodIntoView(index)
    return
  }

  void scrollMethodIntoView(index)
  await selectDepositMethod(method)
}
</script>
<style scoped lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  appearance: textfield; /* 禁用默认浏览器样式 */
  -webkit-appearance: textfield; /* 针对 Safari 和 Webkit 浏览器 */
  -moz-appearance: textfield; /* 针对 Firefox */
}
</style>
