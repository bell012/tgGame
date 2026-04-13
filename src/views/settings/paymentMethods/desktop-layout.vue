<template>
  <div class="bg-bg-2 p-6">
    <div class="overflow-hidden">
      <div
        ref="methodTabsRef"
        class="flex items-center gap-4 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
        @wheel.prevent="handleMethodTabsWheel"
      >
        <button
          v-for="(item, index) in paymentMethodsOptions"
          :key="index"
          type="button"
          :ref="el => setMethodTabRef(el, index)"
          class="payment-method-tab flex shrink-0 items-center justify-center"
          :class="{ 'is-active': isMethodTabActive(item) }"
          @click="handleMethodTabPress(item, index)"
        >
          <img v-if="item.customIcon" class="mr-2 h-[30px] object-contain" :src="item.customIcon" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
    <div v-if="selectPaymentMethodsOption" class="mt-6">
      <div class="text-sm font-bold leading-normal text-text-1">
        {{
          selectPaymentMethodsOption?.kind === 'crypto'
            ? t('withdraw.receive_crypto')
            : t('withdraw.e_wallet_address')
        }}
      </div>
      <div
        v-if="!hasLoadedAccountOptions"
        class="mt-2 grid justify-start gap-2"
        style="grid-template-columns: repeat(auto-fill, 280px)"
      >
        <div
          v-for="index in 6"
          :key="index"
          class="h-[154px] w-[280px] rounded-xl bg-bg-4 animate-pulse"
        />
      </div>
      <div
        v-else-if="accountCardOptions"
        class="mt-2 grid justify-start gap-2"
        style="grid-template-columns: repeat(auto-fill, 280px)"
      >
        <template v-if="hasLoadedAccountOptions">
          <AccountCardComponent
            v-for="(item, index) in accountCardOptions"
            :key="index"
            :option="item"
            :is-active="false"
            :enableDelete="hasDeleteAccount"
            @set-default="modifyDefaultAccountCard"
            @delete="deleteAccountCard"
          />
        </template>

        <button
          v-if="canAddAccount"
          type="button"
          :disabled="!canAddAccount"
          @click="openAddAcountCard"
          class="flex h-[154px] w-[280px] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-theme-primary text-base font-bold text-theme-primary"
        >
          <AddPlusIcon class="mb-3 h-4 w-4 text-current" />
          {{
            selectPaymentMethodsOption.kind == 'crypto'
              ? t('withdraw.add_address', { currency: selectPaymentMethodsOption.label })
              : t('withdraw.add_e_wallet')
          }}
        </button>
      </div>
    </div>
    <DeleteNotificationPop
      v-model="deleteNotificationVisible"
      :label="selectPaymentMethodsOption?.label ?? ''"
      @close="coloseDeleteNotification"
      @confirm="confirmDeleteAccountCard"
    />
    <AddAccountPop
      v-model="addAccountOptionVisible"
      :option="selectPaymentMethodsOption"
      @close="closeAddAcountCard"
      @confirm="addAcountCard"
    />
    <SmsVerificationPop
      v-model="smsVerificationVisible"
      :phone-number="maskedPhoneNumber"
      :sending="isSendingSmsCode"
      :loading="isCheckingSmsCode || isSubmittingAdd"
      :countdown-trigger="smsCountdownTrigger"
      @close="closeSmsVerification"
      @resend="handleAddAccountOptionSmsVerificationResend"
      @confirm="handleAddAccountOptionSmsVerificationConfirm"
    />
    <PaymentPasswordPop
      v-model="paymentPasswordVisible"
      :loading="isCheckingPaymentPassword || isSubmittingAdd"
      @close="closePaymentPasswordVerification"
      @confirm="handleAddAccountOptionPaymentPasswordVerificationConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { type ComponentPublicInstance, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePaymentMethodsFlow } from '@/components/paymentMethods/shared/usePaymentMethodsFlow'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
import AccountCardComponent from '@/components/paymentMethods/accountCard.vue'
import DeleteNotificationPop from '@/components/paymentMethods/deleteNotificationPop.vue'
import AddAccountPop from '@/components/paymentMethods/addAccountPop.vue'
import SmsVerificationPop from '@/components/paymentMethods/smsVerificationPop.vue'
import PaymentPasswordPop from '@/components/paymentMethods/paymentPasswordPop.vue'

const {
  addAccountOptionVisible,
  hasDeleteAccount,
  deleteNotificationVisible,
  paymentPasswordVisible,
  smsVerificationVisible,
  paymentMethodsOptions,
  accountCardOptions,
  hasLoadedAccountOptions,
  canAddAccount,
  selectPaymentMethodsOption,
  maskedPhoneNumber,
  isSendingSmsCode,
  isCheckingSmsCode,
  isCheckingPaymentPassword,
  isSubmittingAdd,
  smsCountdownTrigger,
  openAddAcountCard,
  closeAddAcountCard,
  addAcountCard,
  deleteAccountCard,
  coloseDeleteNotification,
  confirmDeleteAccountCard,
  modifyDefaultAccountCard,
  handleMethodTabClick,
  isMethodTabActive,
  closeSmsVerification,
  handleAddAccountOptionSmsVerificationResend,
  handleAddAccountOptionSmsVerificationConfirm,
  closePaymentPasswordVerification,
  handleAddAccountOptionPaymentPasswordVerificationConfirm
} = usePaymentMethodsFlow()
const { t } = useI18n()

const methodTabsRef = ref<HTMLElement | null>(null)
const methodTabRefs = ref<(HTMLButtonElement | null)[]>([])

const setMethodTabRef = (element: Element | ComponentPublicInstance | null, index: number) => {
  const target =
    element instanceof HTMLButtonElement
      ? element
      : element && '$el' in element && element.$el instanceof HTMLButtonElement
        ? element.$el
        : null

  methodTabRefs.value[index] = target
}

const scrollMethodTabIntoView = (index: number) => {
  const target = methodTabRefs.value[index]

  if (!methodTabsRef.value || !target) {
    return
  }

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

const handleMethodTabsWheel = (event: WheelEvent) => {
  if (!methodTabsRef.value) {
    return
  }

  methodTabsRef.value.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

const handleMethodTabPress = async (
  item: Parameters<typeof handleMethodTabClick>[0],
  index: number
) => {
  handleMethodTabClick(item)
  await nextTick()
  scrollMethodTabIntoView(index)
}
</script>

<style scoped lang="scss">
.payment-method-tab {
  width: 184px;
  height: 62px;
  color: var(--color-text-level-1);
  border-radius: 12px;
  border: 1px solid var(--color-opacity-10);
  opacity: 0.96;
  background: var(--color-background-level-4);
}
.payment-method-tab.is-active {
  border: 1px solid var(--color-theme-level-1);
  background: var(--color-theme-level-3);
}
</style>
