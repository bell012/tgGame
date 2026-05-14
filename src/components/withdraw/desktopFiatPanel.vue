<template>
  <div class="w-full bg-bg-2 p-6 rounded-lg font-['Inter']">
    <div>
      <p class="text-sm font-bold leading-normal text-text-1">{{ t('withdraw.methods') }}</p>
      <div class="mt-2.5 overflow-hidden">
        <div
          ref="methodListRef"
          class="flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
          @wheel.prevent="handleMethodListWheel"
        >
          <div
            class="shrink-0 basis-[calc((100%-3rem)/4)] flex items-center justify-center p-4 rounded-xl lg:hover:bg-theme-3 lg:hover:border-theme-primary"
            :class="{
              'border border-theme-primary bg-theme-3': selectMethodsOption?.label === item.label,
              'border border-transparent bg-bg-4': selectMethodsOption?.label !== item.label
            }"
            v-for="(item, index) in methodsOptions"
            :key="index"
            :ref="el => setMethodItemRef(el, index)"
            @click.stop="selectMethod(item, index)"
          >
            <img class="mr-4 h-6" :src="item.customIcon" />
            <p class="text-base font-bold leading-normal text-text-1">{{ item.label }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-6">
      <div class="text-sm font-bold leading-normal">
        {{ t('withdraw.e_wallet_address') }}
      </div>
      <div
        ref="accountCardsRef"
        class="mt-2 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide touch-pan-x scroll-smooth"
        @wheel.prevent="handleAccountCardsWheel"
      >
        <template v-if="accountCardOptions">
          <AccountCard
            v-for="item in accountCardOptions"
            :key="item.rowId"
            :data-address-card-id="item.rowId"
            :option="item"
            :is-active="accountCardOption?.rowId === item.rowId"
            :enableDelete="false"
            :showDelete="false"
            @set-default="handleModifyDefaultAccountCard"
            @select="handleReceiveAddressCardClick"
          />
        </template>
        <button
          v-if="canAddAccount"
          type="button"
          class="flex h-[154px] w-[280px] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-theme-primary text-base font-bold text-theme-primary"
          @click="emit('openAddAcountCard')"
        >
          <AddPlusIcon class="mb-3 h-4 w-4 text-current" />
          {{ t('withdraw.add_e_wallet') }}
        </button>
      </div>
    </div>
    <div class="mt-6">
      <div>
        <div class="flex items-center justify-between">
          <div class="text-sm font-bold leading-normal">{{ t('withdraw.amount') }}</div>
          <div class="flex items-center text-sm text-text-2">
            {{ t('withdraw.balance') }}：
            <span class="text-theme-primary">{{ formattedBalance }}</span>
            <button
              type="button"
              class="ml-1 inline-flex items-center justify-center text-icon-2"
              @click="emit('refreshBalance')"
            >
              <RefreshIcon class="w-5" :class="{ 'animate-spin': isRefreshingBalance }" />
            </button>
          </div>
        </div>
        <div
          class="mt-2 p-3 flex items-center w-full rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <span class="mr-3 text-xl font-bold leading-none text-theme-primary">{{
            currencySymbol
          }}</span>
          <input
            type="number"
            v-model="amountModel"
            :placeholder="t('withdraw.amount_placeholder')"
            class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
          />
          <button
            v-show="amountModel"
            class="w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
            @click="undefinedAmount"
          >
            <CloseIcon class="h-2.5 w-2.5" />
          </button>
        </div>
      </div>
    </div>
    <div class="mt-4">
      <div v-if="quickAmounts && quickAmounts.length > 0" class="w-full relative">
        <div
          ref="presetsRef"
          class="grid grid-cols-6 gap-2 rounded-tl-lg rounded-tr-lg bg-bg-4 p-2 transition-all duration-300"
          :class="{
            'max-h-64 overflow-y-auto': expanded,
            'max-h-[104px] overflow-hidden': !expanded,
            'rounded-tl-lg rounded-tr-lg': showExpandButton,
            'rounded-lg': !showExpandButton
          }"
        >
          <button
            v-for="(item, index) in quickAmounts"
            :key="`${item.amount ?? index}`"
            type="button"
            class="rounded-lg py-2.5 text-sm font-semibold lg:hover:bg-theme-primary"
            :class="[
              Number(item.amount ?? 0) === Number(amount ?? 0)
                ? 'bg-theme-primary text-text-4'
                : 'bg-bg-2 text-text-1'
            ]"
            @click="applyQuickAmount(item)"
          >
            {{ formatQuickAmount(item.amount) }}
          </button>
        </div>
        <div v-if="showExpandButton" class="w-full rounded-bl-lg rounded-br-lg bg-bg-4 py-2">
          <button
            type="button"
            class="mx-auto flex items-center gap-1 text-xs text-text-3 transition lg:hover:text-text-1"
            @click="expanded = !expanded"
          >
            {{ expanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}
            <ExpandUpDoubleIcon v-if="expanded" class="h-2 w-[9px]" />
            <ExpandDownDoubleIcon v-else class="h-2 w-[9px]" />
          </button>
        </div>
      </div>
    </div>
    <button
      class="mt-6 w-full h-12 flex items-center justify-center lg:hover:btn-primary rounded-lg font-semibold text-text-4"
      :class="[!isWithdrawDisabled ? 'btn-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed']"
      :disabled="isWithdrawDisabled"
      @click="doWithdrawDeposit"
    >
      {{ t('withdraw.withdraw_now') }}
    </button>
  </div>
</template>
<script setup lang="ts">
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import RefreshIcon from '@/static/svg/refresh.svg?component'
import AccountCard from '@/components/paymentMethods/accountCard.vue'
import { computed, type ComponentPublicInstance, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FastAmountItem } from '@/api/interface/withdraw'
import { usePresetGrid } from '@/components/deposit/shared/usePresetGrid'
import type {
  AccountCardOption,
  PaymentMethodsOption
} from '@/components/paymentMethods/shared/usePaymentMethodsService'

interface Props {
  methodsOptions?: PaymentMethodsOption[]
  selectMethodsOption?: PaymentMethodsOption
  accountCardOption?: AccountCardOption
  accountCardOptions?: AccountCardOption[]
  hasSelectedReceiveAddress: boolean
  amount?: number
  quickAmounts?: FastAmountItem[]
  isWithdrawDisabled: boolean
  currencySymbol: string
  isRefreshingBalance: boolean
  formattedBalance: string
  youGetAmount: string
  canAddAccount?: boolean
}
const props = defineProps<Props>()

const { t } = useI18n()
const emit = defineEmits<{
  'update:amount': [value: number | undefined]
  methodTabClick: [value: PaymentMethodsOption]
  applyQuickAmount: [value: FastAmountItem]
  handleOpenAcountListPop: []
  refreshBalance: []
  beginSubmitWithdraw: []
  openAddAcountCard: []
  handleSelectedAccountOption: [value: AccountCardOption]
  modifyDefaultAccountCard: [value: AccountCardOption]
}>()

const methodListRef = ref<HTMLDivElement | null>(null)
const methodItemRefs = ref<Array<HTMLElement | null>>([])
const accountCardsRef = ref<HTMLDivElement | null>(null)
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const showExpandButton = computed(() => props.quickAmounts && props.quickAmounts.length > 12)
const amountModel = computed({
  get: () => props.amount,
  set: value => emit('update:amount', value)
})

const setMethodItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  const target =
    el instanceof HTMLElement
      ? el
      : el && '$el' in el && el.$el instanceof HTMLElement
        ? el.$el
        : null

  methodItemRefs.value[index] = target
}

const handleMethodListWheel = (event: WheelEvent) => {
  if (!methodListRef.value) return

  methodListRef.value.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

const selectMethod = async (option: PaymentMethodsOption, index: number) => {
  emit('methodTabClick', option)
  scrollMethodIntoView(index)
}

const handleAccountCardsWheel = (event: WheelEvent) => {
  if (!accountCardsRef.value) return

  accountCardsRef.value.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

const handleReceiveAddressCardClick = async (option: AccountCardOption) => {
  emit('handleSelectedAccountOption', option)
  await nextTick()
  scrollAccountCardIntoView(String(option.rowId))
}

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

const scrollAccountCardIntoView = async (localId?: string | null) => {
  if (!localId) return

  await nextTick()

  const container = accountCardsRef.value
  const target = container?.querySelector<HTMLElement>(`[data-address-card-id="${localId}"]`)

  if (!container || !target) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

const applyQuickAmount = (value: FastAmountItem) => {
  emit('applyQuickAmount', value)
}

const formatQuickAmount = (value: FastAmountItem['amount']) => {
  const nextAmount = Number(value ?? 0)

  return Number.isFinite(nextAmount) && nextAmount > 0
    ? nextAmount.toLocaleString()
    : String(value ?? '')
}

const doWithdrawDeposit = () => {
  if (props.isWithdrawDisabled) {
    return
  }
  emit('beginSubmitWithdraw')
}

const undefinedAmount = () => {
  amountModel.value = undefined
}

const handleModifyDefaultAccountCard = (option: AccountCardOption) => {
  emit('modifyDefaultAccountCard', option)
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
