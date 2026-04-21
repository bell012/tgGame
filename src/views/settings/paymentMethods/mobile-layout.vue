<template>
  <div class="relative min-h-full w-full">
    <div class="fixed left-0 right-0 top-[49px] z-20 overflow-hidden bg-bg-1 p-3.5">
      <div
        ref="methodTabsRef"
        class="flex w-full items-center gap-2 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
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
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
    <div v-if="selectPaymentMethodsOption" class="px-0 pb-[104px] pt-[64px]">
      <div v-if="!hasLoadedAccountOptions" class="flex flex-col gap-2.5 px-3.5">
        <div v-for="index in 6" :key="index" class="h-[76px] rounded-xl bg-bg-2 animate-pulse" />
      </div>
      <div
        v-else-if="accountCardOptions && accountCardOptions.length > 0"
        class="flex flex-col gap-2.5"
      >
        <AccountItemComponent
          v-for="(item, index) in accountCardOptions"
          :key="index"
          :option="item"
          :is-active="false"
          :enableDelete="hasDeleteAccount"
          @set-default="modifyDefaultAccountCard"
          @delete="deleteAccountCard"
          @select="openAccountDetailsPop"
        />
      </div>
      <!-- 空状态区域 -->
      <ThemedEmptyState
        v-else
        :dark-image="defaultImgDark"
        :light-image="defaultImgLight"
        image-alt="$t('referral.referralRecords.title')"
        message="No data available at the moment."
        class="mt-[122px]"
        text-class="mt-[10px] w-[200px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
      />
    </div>
    <div class="fixed bottom-0 left-0 z-20 w-full bg-bg-1 px-3.5 pb-7 pt-3.5">
      <button
        type="button"
        class="flex h-10 w-full items-center justify-center rounded-lg bg-theme-primary text-sm font-bold text-text-4"
        :class="canAddAccount ? 'bg-theme-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed'"
        :disabled="!canAddAccount"
        @click="openAddAcountCard"
      >
        <AddPlusIcon class="mr-1 h-4 w-4 text-current" />
        {{
          selectPaymentMethodsOption && selectPaymentMethodsOption.kind == 'crypto'
            ? t('withdraw.add_address', { currency: selectPaymentMethodsOption.label })
            : t('withdraw.add_e_wallet')
        }}
      </button>
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
    <AccountDetailsPop
      v-model="accountDetailsPopVisible"
      :option="selectAccountCardOption"
      @close="closeAccountDetailsPop"
    />
    <KindReminderPop
      v-model="kindReminderVisible"
      @settings="handleKindReminderSettings"
      @skip="handleKindReminderSkid"
      @close="handleKindReminderSkid"
    />
  </div>
</template>

<script setup lang="ts">
import { type ComponentPublicInstance, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePaymentMethodsFlow } from '@/components/paymentMethods/shared/usePaymentMethodsFlow'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
import {
  default as defaultImgDark,
  default as defaultImgLight
} from '@/static/img/explore/default.png'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import AccountItemComponent from '@/components/paymentMethods/accountItem.vue'
import DeleteNotificationPop from '@/components/paymentMethods/deleteNotificationPop.vue'
import AddAccountPop from '@/components/paymentMethods/addAccountPop.vue'
import SmsVerificationPop from '@/components/paymentMethods/smsVerificationPop.vue'
import PaymentPasswordPop from '@/components/paymentMethods/paymentPasswordPop.vue'
import AccountDetailsPop from '@/components/paymentMethods/accountDetailsPop.vue'
import KindReminderPop from '@/components/paymentMethods/kindReminderPop.vue'

const {
  kindReminderVisible,
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
  accountDetailsPopVisible,
  selectAccountCardOption,
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
  handleKindReminderSettings,
  handleKindReminderSkid,
  handleAddAccountOptionSmsVerificationResend,
  handleAddAccountOptionSmsVerificationConfirm,
  closePaymentPasswordVerification,
  handleAddAccountOptionPaymentPasswordVerificationConfirm,
  openAccountDetailsPop,
  closeAccountDetailsPop
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
  padding: 8px 20px;
  color: var(--color-text-level-1);
  font-size: 12px;
  font-weight: 700;
  border-radius: 18px;
  border: 1px solid var(--color-opacity-10);
  opacity: 0.96;
  background: var(--color-background-level-4);
}
.payment-method-tab.is-active {
  border: 1px solid var(--color-theme-level-1);
  background: var(--color-theme-level-3);
}
</style>
