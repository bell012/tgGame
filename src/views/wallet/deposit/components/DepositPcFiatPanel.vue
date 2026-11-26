<template>
  <DepositPcFiatSkeleton v-if="isInitialLoading" />

  <!-- 法币充值面板容器 -->
  <div
    v-else-if="hasPanelContent"
    class="flex w-full flex-col gap-4 rounded-[12px] bg-bg-2 p-6 font-['Inter']"
  >
    <!-- 充值类型 + 当前货币 -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex min-w-0 flex-wrap gap-2">
        <button
          v-for="category in categoryOptions"
          :key="category.id"
          type="button"
          class="flex items-center justify-center rounded-[8px] px-6 py-2 text-sm font-bold leading-5 transition-colors"
          :class="
            selectedCategoryId === category.id
              ? 'bg-theme-primary text-text-4'
              : 'bg-opacity-6 text-text-2 lg:hover:text-text-1'
          "
          @click="selectCategory(category.id)"
        >
          {{ category.label }}
        </button>
      </div>

      <div class="relative shrink-0">
        <button
          type="button"
          class="flex items-center gap-1 rounded-full bg-opacity-6 py-2 pl-3 pr-2"
          @click="currencyDropdownShow = !currencyDropdownShow"
          :disabled="embedded"
        >
          <img :src="currentCurrencyIcon" alt="" class="size-5 object-contain" />
          <span class="text-sm font-bold leading-5 text-text-2">{{ currentCurrencyCode }}</span>
          <DropdownChevron
            v-if="!embedded"
            class="size-2.5 text-text-2 transition-transform"
            :class="{ 'rotate-180': currencyDropdownShow }"
          />
        </button>
        <template v-if="currencyDropdownShow">
          <div class="fixed inset-0 z-10" @click="currencyDropdownShow = false" />
          <div
            class="absolute right-0 top-[calc(100%+4px)] z-20 w-[240px] rounded-lg border border-opacity-10 bg-bg-1 p-2.5"
          >
            <CurrencySelectorList
              :visible="currencyDropdownShow"
              :options="currencySelectorOptions"
              :selected-value="currentCurrencyCode"
              mode="radio"
              list-class="max-h-[280px] overflow-y-auto"
              item-class="flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left lg:hover:bg-opacity-6"
              selected-item-class="bg-opacity-10"
              @select="handleCurrencySelect"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- 充值方式 -->
    <div v-if="showMethodSection" class="flex flex-col gap-2">
      <p class="text-sm font-bold leading-5 text-text-1">{{ t('deposit.methods') }}</p>
      <div
        v-if="methods.length > 0"
        class="flex flex-wrap gap-2"
        :class="{ 'opacity-60': methodsLoading }"
      >
        <button
          v-for="item in methods"
          :key="item.rowId"
          type="button"
          class="relative flex items-center justify-center gap-2 rounded-[8px] px-5 py-3 transition-colors"
          :class="
            selectedMethod?.rowId === item.rowId
              ? 'bg-theme-primary text-text-4'
              : 'bg-opacity-6 text-text-2 lg:hover:text-text-1'
          "
          @click="selectMethod(item)"
        >
          <DepositBonusBadge
            v-if="resolveMethodBonusRatio(item) > 0"
            :ratio="resolveMethodBonusRatio(item)"
            class="-top-[5px] right-[6px]"
          />
          <span v-if="resolveMethodIcon(item)" class="flex h-4 w-14 items-center justify-center">
            <img
              :src="resolveMethodIcon(item)"
              alt=""
              class="max-h-full max-w-full object-contain"
            />
          </span>
          <span class="whitespace-nowrap text-sm font-bold leading-5">
            {{ resolveMethodName(item) }}
          </span>
        </button>
      </div>
      <p v-else-if="!methodsLoading" class="py-3 text-center text-sm text-text-3">
        {{ t('deposit.unavailable') }}
      </p>
    </div>

    <!-- 充值金额 -->
    <div class="flex flex-col gap-2">
      <p class="text-sm font-bold leading-5 text-text-1">{{ t('deposit.deposit_amount') }}</p>
      <div
        class="flex h-12 w-full items-center gap-2 rounded-[8px] border bg-input-3 px-3"
        :class="isAmountInputHighlighted ? 'border-theme-primary' : 'border-opacity-10'"
      >
        <span class="inline-flex size-6 shrink-0 items-center text-xl leading-6 text-theme-primary">
          {{ getCurrencySymbol(currentCurrencyCode) }}
        </span>
        <input
          v-model.number="amount"
          type="number"
          :readonly="!isManualAmountAllowed"
          :inputmode="isManualAmountAllowed ? 'decimal' : 'none'"
          :placeholder="amountPlaceholder"
          class="min-w-0 flex-1 bg-transparent text-sm text-text-1 outline-none placeholder:text-sm placeholder:text-text-3 focus:outline-none focus:ring-0"
          :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
        />
        <button
          v-show="!isDepositDisabled"
          type="button"
          class="flex size-6 shrink-0 items-center justify-center rounded-md bg-opacity-10"
          @click="clearAmount"
        >
          <CloseIcon class="size-2.5" />
        </button>
      </div>
    </div>

    <!-- 流水选项与提示 -->
    <div class="flex flex-col gap-2">
      <div v-if="showWageringSection" class="border-b border-opacity-10 pb-3">
        <div class="flex items-center gap-6 overflow-x-auto scrollbar-hide pt-[10px]">
          <template v-for="(item, index) in wageringOptions" :key="item.rowId">
            <button
              type="button"
              class="relative shrink-0 whitespace-nowrap text-sm leading-5 transition-colors"
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
                class="absolute inset-x-0 -bottom-3 h-px bg-theme-primary"
              ></span>
            </button>
            <span
              v-if="index !== wageringOptions.length - 1"
              class="h-[14px] w-px shrink-0 bg-opacity-10"
            ></span>
          </template>
        </div>
      </div>
      <p class="text-xs leading-[15px] text-secondary-7">
        {{ t('deposit.withdrawal_no_wagering_tip') }}
      </p>
    </div>

    <!-- 快捷金额 + 立即充值 -->
    <div class="flex flex-col gap-8">
      <div class="flex flex-col items-center gap-2 rounded-[16px] bg-bg-4 p-2">
        <div
          ref="presetsRef"
          class="grid w-full grid-cols-6 gap-2 pt-1 transition-all duration-300"
          :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[92px] overflow-hidden'"
        >
          <button
            v-for="preset in presetAmounts"
            :key="preset"
            type="button"
            class="relative flex h-10 items-center justify-center rounded-[8px] text-base font-bold leading-[19px] transition-colors"
            :class="
              preset === amount
                ? 'bg-theme-primary text-text-4'
                : 'bg-bg-3 text-text-1 lg:hover:bg-hover-1'
            "
            @click="selectPresetAmount(preset)"
          >
            <span>{{ preset }}</span>
          </button>
        </div>
        <button
          v-if="canExpand"
          type="button"
          class="flex h-5 items-center gap-2 text-[13px] leading-4 text-text-3 transition lg:hover:text-text-1"
          @click="expanded = !expanded"
        >
          {{ expanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}
          <ExpandUpDoubleIcon v-if="expanded" class="size-2" />
          <ExpandDownDoubleIcon v-else class="size-2" />
        </button>
      </div>

      <button
        type="button"
        class="flex h-12 w-full items-center justify-center rounded-[8px] text-sm font-bold leading-5 text-text-4"
        :class="!isDepositDisabled ? 'btn-primary' : 'cursor-not-allowed bg-theme-2'"
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
    :message="$t('notifications.transactionsEmptyMessage')"
    text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
  />
  <!-- 充值订单弹窗 -->
  <depositFiatOrderPop
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
import CurrencySelectorList from '@/components/common/currency-selector/index.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import DropdownChevron from '@/static/svg/casino/dropdown_chevron.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import CloseIcon from '@/static/svg/close.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import { getCurrencySymbol } from '@/utils/locale'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepositFiatFlow } from '../shared'
import DepositPcFiatSkeleton from './DepositPcFiatSkeleton.vue'
import depositFiatOrderPop from './order/fiat/depositFiatOrderPop.vue'
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

const { currentCurrencyCode, currentCurrencyIcon, currencyOptions, setDisplayCurrency } =
  useDisplayCurrency()

const {
  isInitialLoading,
  payColumnLoaded,
  methodsLoading,
  hasPanelContent,
  categoryOptions,
  selectedCategoryId,
  methods,
  selectedMethod,
  selectedDiscountItem,
  presetAmounts,
  amount,
  orderInfo,
  orderPopShow,
  isDepositDisabled,
  isManualAmountAllowed,
  wageringOptions,
  showMethodSection,
  showWageringSection,
  amountPlaceholder,
  isAmountInputHighlighted,
  clearAmount,
  selectPresetAmount,
  resolveMethodIcon,
  resolveMethodBonusRatio,
  resolveMethodName,
  selectWagering,
  selectCategory,
  selectMethod,
  doDeposit,
  handleClose,
  handleHidden
} = useDepositFiatFlow({
  isMobile: false,
  initialMethodCode: props.initialMethodCode,
  emitHidden: value => emit('hidden', value),
  emitHiddenOnOrderOpen: false,
  emitHiddenOnOrderHidden: false
})

const currencyDropdownShow = ref(false)
const currencySelectorOptions = computed(() =>
  currencyOptions.value.map(item => ({
    value: item.code,
    label: item.code,
    icon: item.icon
  }))
)

const handleCurrencySelect = (code: string) => {
  setDisplayCurrency(code)
  currencyDropdownShow.value = false
}

const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded, canExpand } = usePresetGrid(presetsRef, presetAmounts, 6)

const orderPopup = ref<InstanceType<typeof depositFiatOrderPop>>()
defineExpose({ back: () => orderPopup.value?.back() ?? false })
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
