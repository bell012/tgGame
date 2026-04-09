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
              'border border-theme-primary bg-theme-3': selectedMethod.name === item.name,
              'border border-transparent bg-bg-4': selectedMethod.name !== item.name
            }"
            v-for="(item, index) in payMethods"
            :key="item.paymentCode ?? index"
            :ref="el => setMethodItemRef(el, index)"
            @click.stop="selectMethod(item, index)"
          >
            <img class="mr-4 h-6" :src="item.icon" />
            <p class="text-base font-bold leading-normal text-text-1">{{ item.name }}</p>
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
        <button
          v-for="item in availableAccounts"
          :key="item.localId"
          type="button"
          :data-account-card-id="item.localId"
          class="relative flex h-[154px] w-[280px] shrink-0 flex-col justify-center rounded-xl border bg-transparent text-base font-bold text-common-100 transition-colors"
          :style="{
            border:
              selectedAccount?.localId === item.localId
                ? '1px solid var(--color-theme-level-1)'
                : '1px solid transparent'
          }"
          @click="handleAccountCardClick(item.localId)"
        >
          <component
            :is="resolveFiatCardBackground(selectedMethod.paymentCode)"
            v-if="resolveFiatCardBackground(selectedMethod.paymentCode)"
            class="absolute left-0 top-0 h-full w-full"
          />
          <div v-else class="absolute left-0 top-0 h-full w-full rounded-xl bg-bg-4" />
          <div class="relative z-10 h-full w-full px-3 py-2">
            <div class="flex items-center">
              <div
                class="mr-2 h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full border border-common-100"
              >
                <gameErrImg
                  :img="{ src: selectedMethod.selectedIcon, maintain: false, fit: 'contain' }"
                  class="h-full w-full"
                />
              </div>
              <span class="truncate">{{ selectedMethod.name }}</span>
            </div>
            <div class="mt-4 flex items-center justify-between text-xs">
              <div>{{ t('withdraw.account') }}：</div>
              <div class="text-right font-bold">{{ item.accountNo }}</div>
            </div>
            <div class="mt-2 flex items-center justify-between text-xs">
              <div>{{ t('withdraw.name') }}：</div>
              <div class="truncate text-right font-bold">{{ item.accountName }}</div>
            </div>
            <div
              class="absolute bottom-0 left-0 flex w-full items-center justify-between rounded-b-xl bg-mask-20 px-3 py-2 text-xs"
            >
              <div>{{ t('withdraw.default_wallet') }}</div>
              <button
                type="button"
                class="flex h-4 w-[30px] items-center rounded-full p-px transition-colors duration-200"
                :class="
                  Number(item.defaultCard ?? item.isDefault ?? 0) === 1
                    ? 'bg-theme-primary'
                    : 'bg-white/60'
                "
                @click.stop="handleToggleAccountDefault(item.localId)"
              >
                <div
                  class="h-[14px] w-[14px] rounded-full bg-common-100 transition-transform duration-200"
                  :class="
                    Number(item.defaultCard ?? item.isDefault ?? 0) === 1
                      ? 'translate-x-[14px]'
                      : 'translate-x-0'
                  "
                />
              </button>
            </div>
          </div>
        </button>
        <button
          v-if="canAddAccount"
          type="button"
          class="flex h-[154px] w-[280px] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-theme-primary text-base font-bold text-theme-primary"
          @click="openAddAccount"
        >
          <AddPlusIcon class="mb-3 h-4 w-4 text-current" />
          {{ t('withdraw.add_e_wallet') }}
        </button>
        <withdrawFiatAccountListPop
          v-model="accountListVisible"
          :items="availableAccounts"
          :selected-id="selectedAccount?.localId"
          :icon="selectedMethod.selectedIcon"
          :show-add-button="canAddAccount"
          @select="handleSelectAccount"
          @add="openAddAccount"
        />
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
              @click="refreshBalance"
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
            v-model="amount"
            :placeholder="t('withdraw.amount_placeholder')"
            class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
          />
          <button
            v-show="!isAmountDisabled"
            class="w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
            @click="amount = undefined"
          >
            <CloseIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <div class="mt-4">
      <div v-if="quickAmounts.length" class="w-full relative">
        <div
          ref="presetsRef"
          class="grid grid-cols-6 gap-2 rounded-tl-lg rounded-tr-lg bg-bg-4 p-2 transition-all duration-300"
          :class="expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[104px] overflow-hidden'"
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
    <withdrawFiatAddAccountPop
      v-model="addAccountVisible"
      v-model:account-no="pendingAccountNo"
      v-model:account-name="pendingAccountName"
      @close="closeAddAccount"
      @confirm="confirmAddAccount"
    />
    <withdrawPaymentPasswordPop
      v-model="addAccountPaymentPasswordVisible"
      :amount="0"
      :currency-code="currentCurrency"
      :loading="isSubmittingAddAccount"
      :show-amount-section="false"
      :confirm-text="t('common.confirm')"
      :description-text="t('withdraw.verification_transaction_password')"
      @close="closeAddAccountPaymentPassword"
      @confirm="handleAddAccountPaymentPasswordConfirm"
    />
    <withdrawSmsVerificationPop
      v-model="addAccountSmsVerificationVisible"
      :amount="0"
      :currency-code="currentCurrency"
      :phone-number="maskedPhoneNumber"
      :sending="isSendingAddAccountSmsCode"
      :loading="isCheckingAddAccountSmsCode || isSubmittingAddAccount"
      :countdown-trigger="addAccountSmsCountdownTrigger"
      :show-amount-section="false"
      :confirm-text="t('common.confirm')"
      @close="closeAddAccountSmsVerification"
      @resend="handleAddAccountSmsVerificationResend"
      @confirm="handleAddAccountSmsVerificationConfirm"
    />
  </div>
</template>
<script setup lang="ts">
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import GCashCardIcon from '@/static/svg/withdraw/GCash_card.svg?component'
import GrabPayCardIcon from '@/static/svg/withdraw/GrabPay_card.svg?component'
import MAYACardIcon from '@/static/svg/withdraw/MAYA_card.svg?component'
import ShopeePayCardIcon from '@/static/svg/withdraw/ShopeePay_card.svg?component'
import gameErrImg from '@/components/common/gameErrImg.vue'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import RefreshIcon from '@/static/svg/refresh.svg?component'
import { computed, type ComponentPublicInstance, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FastAmountItem } from '@/api/interface/withdraw'
import { usePresetGrid } from '@/components/deposit/shared/usePresetGrid'
import withdrawFiatAccountListPop from './withdrawFiatAccountListPop.vue'
import withdrawFiatAddAccountPop from './withdrawFiatAddAccountPop.vue'
import withdrawPaymentPasswordPop from './withdrawPaymentPasswordPop.vue'
import withdrawSmsVerificationPop from './withdrawSmsVerificationPop.vue'
import type { WithdrawSubmitPayload } from './shared/types'
import { useWithdrawFiat } from './shared/useWithdrawFiat'

const { t } = useI18n()
const {
  accountListVisible,
  amount,
  applyQuickAmount,
  availableAccounts,
  addAccountVisible,
  addAccountPaymentPasswordVisible,
  addAccountSmsCountdownTrigger,
  addAccountSmsVerificationVisible,
  balanceAmount,
  canAddAccount,
  closeAddAccount,
  closeAddAccountPaymentPassword,
  closeAddAccountSmsVerification,
  confirmAddAccount,
  currentCurrency,
  currencySymbol,
  formattedBalance,
  handleAddAccountPaymentPasswordConfirm,
  handleAddAccountSmsVerificationConfirm,
  handleAddAccountSmsVerificationResend,
  isCheckingAddAccountSmsCode,
  isAmountDisabled,
  isRefreshingBalance,
  isSendingAddAccountSmsCode,
  isSubmittingAddAccount,
  isWithdrawDisabled,
  maskedPhoneNumber,
  openAddAccount,
  payMethods,
  pendingAccountName,
  pendingAccountNo,
  quickAmounts,
  refreshBalance,
  handleSelectAccount,
  handleToggleAccountDefault,
  selectedAccount,
  selectedMethod,
  selectMethod: selectMethodOption
} = useWithdrawFiat()

const methodListRef = ref<HTMLDivElement | null>(null)
const methodItemRefs = ref<Array<HTMLElement | null>>([])
const accountCardsRef = ref<HTMLDivElement | null>(null)
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded } = usePresetGrid(presetsRef)
const showExpandButton = computed(() => quickAmounts.value.length > 6)

const emit = defineEmits<{
  submit: [payload: WithdrawSubmitPayload]
}>()

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

const selectMethod = async (method: (typeof payMethods.value)[number], index: number) => {
  await selectMethodOption(method)
  scrollMethodIntoView(index)
}

const handleAccountCardsWheel = (event: WheelEvent) => {
  if (!accountCardsRef.value) return

  accountCardsRef.value.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

const handleAccountCardClick = async (localId: string) => {
  handleSelectAccount(localId)
  await nextTick()

  const container = accountCardsRef.value
  const target = container?.querySelector<HTMLElement>(`[data-account-card-id="${localId}"]`)

  target?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest'
  })
}

const resolveFiatCardBackground = (paymentCode?: string | number) => {
  const normalized = String(paymentCode ?? '').trim()

  if (normalized === '13') return GCashCardIcon
  if (normalized === '17') return MAYACardIcon
  if (normalized === '59') return GrabPayCardIcon
  if (normalized === '60') return ShopeePayCardIcon

  return null
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

const formatQuickAmount = (value: FastAmountItem['amount']) => {
  const nextAmount = Number(value ?? 0)

  return Number.isFinite(nextAmount) && nextAmount > 0
    ? nextAmount.toLocaleString()
    : String(value ?? '')
}

const doWithdrawDeposit = () => {
  if (isWithdrawDisabled.value) {
    return
  }

  emit('submit', {
    tabType: 'Fiat',
    amount: Number(amount.value),
    balanceAmount: balanceAmount.value,
    channelId: 3,
    currencyCode: currentCurrency.value,
    methodLabel: selectedMethod.value.name,
    methodIcon: selectedMethod.value.selectedIcon || selectedMethod.value.icon,
    paymentCode: selectedMethod.value.paymentCode,
    accountRowId: selectedAccount.value?.rowId,
    phoneNumber: selectedAccount.value?.accountNo,
    accountName: selectedAccount.value?.accountName
  })
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
