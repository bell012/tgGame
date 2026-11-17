<template>
  <DepositMobileFiatSkeleton v-if="isInitialLoading" />

  <!-- 法币充值面板容器 -->
  <div
    v-else-if="hasPanelContent"
    class="flex w-full flex-col gap-[15px] rounded-[10px] bg-bg-2 p-[14px] font-inter"
  >
    <!-- 当前货币 -->
    <button
      type="button"
      class="flex h-9 w-full items-center justify-between rounded-[8px] bg-opacity-6 px-[10px]"
      @click="currencyPopupShow = true"
    >
      <span class="text-xs leading-[15px] text-text-1">{{ t('deposit.current_currency') }}</span>
      <span class="flex items-center gap-2">
        <span class="flex items-end gap-[5px]">
          <img :src="currentCurrencyIcon" alt="" class="size-[17px] object-contain" />
          <span class="text-[13px] leading-4 text-text-1">{{ currentCurrencyCode }}</span>
        </span>
        <DropdownChevron class="size-2 text-text-2" />
      </span>
    </button>

    <!-- 充值类型 -->
    <div class="flex flex-col gap-[10px]">
      <p class="text-sm font-medium leading-[17px] text-text-1">
        {{ t('deposit.deposit_type') }}
      </p>
      <div class="flex gap-[5px] overflow-x-auto scrollbar-hide touch-pan-x">
        <button
          v-for="category in categoryOptions"
          :key="category.id"
          type="button"
          class="flex h-9 min-w-0 flex-1 shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] px-[14px] text-xs leading-[15px]"
          :class="
            selectedCategoryId === category.id
              ? 'bg-theme-primary font-bold text-text-4'
              : 'bg-opacity-6 font-medium text-text-2'
          "
          @click="selectCategory(category.id)"
        >
          {{ category.label }}
        </button>
      </div>
    </div>

    <!-- 充值方式 -->
    <div class="flex flex-col gap-[10px]">
      <p class="text-sm font-medium leading-[17px] text-text-1">{{ t('deposit.methods') }}</p>
      <div
        v-if="methods.length > 0"
        class="grid grid-cols-3 gap-[7px]"
        :class="{ 'opacity-60': methodsLoading }"
      >
        <button
          v-for="item in methods"
          :key="item.rowId"
          type="button"
          class="flex min-w-0 flex-col items-center gap-[3px] rounded-[8px] p-[8px]"
          :class="
            selectedMethod?.rowId === item.rowId
              ? 'bg-theme-primary font-bold text-text-4'
              : 'bg-opacity-6 text-text-2'
          "
          @click="selectMethod(item)"
        >
          <span class="flex h-6 w-full items-center justify-center">
            <img
              v-if="resolveMethodIcon(item)"
              :src="resolveMethodIcon(item)"
              alt=""
              class="max-h-full max-w-full object-contain"
            />
          </span>
          <span class="w-full truncate text-center text-xs leading-[15px]">
            {{ resolveMethodName(item) }}
          </span>
        </button>
      </div>
      <p v-else-if="!methodsLoading" class="py-3 text-center text-xs text-text-3">
        {{ t('deposit.unavailable') }}
      </p>
    </div>

    <!-- 充值金额 -->
    <div class="flex flex-col gap-[14px]">
      <div class="flex flex-col gap-[10px]">
        <p class="text-sm font-medium leading-[17px] text-text-1">
          {{ t('deposit.deposit_amount') }}
        </p>
        <div
          class="flex h-[45px] w-full items-center gap-[7px] rounded-[8px] border bg-mask-20 px-[14px]"
          :class="isAmountInputHighlighted ? 'border-theme-primary' : 'border-opacity-10'"
        >
          <span
            class="inline-flex size-5 shrink-0 items-center text-xl leading-5 text-theme-primary"
          >
            {{ getCurrencySymbol(currentCurrencyCode) }}
          </span>
          <input
            v-model.number="amount"
            type="number"
            :readonly="!isManualAmountAllowed"
            :inputmode="isManualAmountAllowed ? 'decimal' : 'none'"
            :placeholder="amountPlaceholder"
            class="min-w-0 flex-1 bg-transparent text-xs text-text-1 outline-none placeholder:text-xs placeholder:text-text-3 focus:outline-none focus:ring-0"
            :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
          />
        </div>
      </div>

      <div class="flex flex-col gap-[10px]">
        <!-- 流水选项 -->
        <div class="overflow-x-auto scrollbar-hide touch-pan-x border-b border-opacity-10">
          <div class="flex w-max items-center gap-[14px] pb-[8px]">
            <template v-for="(item, index) in wageringOptions" :key="item.rowId">
              <button
                type="button"
                class="relative shrink-0 whitespace-nowrap text-xs leading-[15px]"
                :class="
                  selectedDiscountItem?.rowId === item.rowId
                    ? 'font-bold text-text-1'
                    : 'text-text-2'
                "
                @click="selectWagering(item.rowId)"
              >
                {{ item.label }}
                <span
                  v-if="selectedDiscountItem?.rowId === item.rowId"
                  class="absolute inset-x-0 -bottom-[9px] h-px bg-theme-primary"
                ></span>
              </button>
              <span
                v-if="index !== wageringOptions.length - 1"
                class="h-[13px] w-px shrink-0 bg-opacity-10"
              ></span>
            </template>
          </div>
        </div>

        <p class="text-[11px] leading-[13px] text-secondary-7">
          {{ t('deposit.withdrawal_no_wagering_tip') }}
        </p>

        <!-- 预设金额 -->
        <div class="flex flex-col items-center gap-[6px] rounded-[8px] bg-bg-4 p-[10px]">
          <div
            ref="presetsRef"
            class="grid w-full grid-cols-3 gap-[6px] transition-all duration-300"
            :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[86px] overflow-hidden'"
          >
            <button
              v-for="preset in presetAmounts"
              :key="preset"
              type="button"
              class="relative flex h-10 items-center justify-center rounded-[7px] text-base font-bold leading-[19px]"
              :class="preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-3 text-text-1'"
              @click="selectPresetAmount(preset)"
            >
              <span>{{ preset }}</span>
              <span
                v-if="presetDiscountRatioMap[preset] !== undefined"
                class="absolute -right-1 -top-2 bg-contain bg-center bg-no-repeat px-2 pb-0.5 text-[10px] font-normal text-text-1"
                :style="{ backgroundImage: `url(${addBonusBadgeBg})` }"
              >
                {{ t('deposit.bonus_label', { ratio: presetDiscountRatioMap[preset] }) }}
              </span>
            </button>
          </div>
          <button
            type="button"
            class="flex h-[17px] items-center gap-[5px] text-[11px] leading-[13px] text-text-3"
            @click="expanded = !expanded"
          >
            {{ expanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}
            <ExpandUpDoubleIcon v-if="expanded" class="h-2 w-[9px]" />
            <ExpandDownDoubleIcon v-else class="h-2 w-[9px]" />
          </button>
        </div>
      </div>
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

  <!-- 立即充值 -->
  <button
    v-if="!isInitialLoading && hasPanelContent"
    type="button"
    class="btn-primary mt-5 flex h-[47px] w-full items-center justify-center rounded-[8px] text-base font-bold leading-[19px] text-text-4"
    :class="{ 'cursor-not-allowed opacity-60': isDepositDisabled }"
    :disabled="isDepositDisabled"
    @click="doDeposit"
  >
    {{ t('deposit.deposit_now') }}
  </button>

  <CurrencyPopup
    v-model:visible="currencyPopupShow"
    :selected-currency="currentCurrencyCode"
    :options="currencyOptions"
    @select="setDisplayCurrency"
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
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useIsMobile } from '@/composables/useMediaQuery'
import addBonusBadgeBg from '@/static/img/deposit/add-bonus-badge.png'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import DropdownChevron from '@/static/svg/casino/dropdown_chevron.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import { getCurrencySymbol } from '@/utils/locale'
import CurrencyPopup from '@/views/personalCenter/components/CurrencyPopup.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepositFiatFlow } from '../shared'
import DepositMobileFiatSkeleton from './DepositMobileFiatSkeleton.vue'
import depositFiatOrderPop from './order/fiat/depositFiatOrderPop.vue'
import { usePresetGrid } from './shared/usePresetGrid'

const { t } = useI18n()
const isMobile = useIsMobile()

const props = defineProps<{
  initialMethodCode?: string
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
  presetDiscountRatioMap,
  wageringOptions,
  amountPlaceholder,
  isAmountInputHighlighted,
  selectPresetAmount,
  resolveMethodIcon,
  resolveMethodName,
  selectWagering,
  selectCategory,
  selectMethod,
  doDeposit,
  handleClose,
  handleHidden
} = useDepositFiatFlow({
  isMobile,
  initialMethodCode: props.initialMethodCode,
  emitHidden: value => emit('hidden', value)
})

const currencyPopupShow = ref(false)
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
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
