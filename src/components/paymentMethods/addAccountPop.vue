<template>
  <PopShell
    v-model="visible"
    :transition-type="isMobile ? 'bottom-sheet' : 'modal'"
    @close="handleClose"
  >
    <div
      class="relative mx-auto flex w-full flex-col rounded-t-[12px] bg-bg-1 px-4 pb-5 pt-4 font-['Inter'] sm:w-[464px] sm:rounded-[24px] sm:p-8"
    >
      <div class="flex items-center justify-between">
        <h2 class="mx-auto sm:mx-0 text-xl font-bold leading-normal text-text-1">
          {{
            option?.kind == 'crypto'
              ? t('withdraw.add_address', { currency: option?.label })
              : t('withdraw.add_e_wallet')
          }}
        </h2>
        <button
          type="button"
          class="absolute right-4 top-4 hidden h-6 w-6 items-center justify-center rounded-md bg-opacity-10 text-text-1 sm:flex"
          @click="handleClose"
        >
          <CloseIcon class="h-2.5 w-2.5" />
        </button>
      </div>

      <div v-if="option?.kind == 'crypto'" class="mt-2.5">
        <div class="flex items-center justify-between rounded-lg bg-bg-2 p-3.5 sm:p-3">
          <p class="text-sm sm:text-base leading-normal text-text-1">{{ t('withdraw.crypto') }}</p>
          <div class="flex items-center">
            <div
              v-if="option.customRoundIcon"
              class="mr-2 h-4 w-4 shrink-0 overflow-hidden rounded-full"
            >
              <gameRemoteImg
                :img="{ src: option.customRoundIcon, maintain: false, fit: 'contain' }"
                class="h-full w-full"
              />
            </div>
            <span class="text-sm sm:text-base font-bold leading-normal text-text-1">
              {{ option.label }}
            </span>
          </div>
        </div>
        <button
          v-if="isMobile"
          type="button"
          class="mt-2.5 flex w-full items-center justify-between rounded-lg bg-bg-2 p-3.5 sm:p-3 text-left"
          @click="networkListVisible = true"
        >
          <div class="flex w-full items-center justify-between">
            <p class="text-sm sm:text-base leading-normal text-text-1">
              {{ t('withdraw.select_network') }}
            </p>
            <div class="flex items-center">
              <span class="text-sm sm:text-base font-bold leading-normal text-text-1">
                {{ accountName }}
              </span>
              <div
                class="ml-2 flex h-5 w-5 items-center justify-center rounded-md bg-opacity-10 text-text-1"
              >
                <ArrowDownIcon class="h-5 w-5" />
              </div>
            </div>
          </div>
        </button>
        <div v-else ref="desktopTriggerRef" class="relative mt-2.5">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-lg bg-bg-2 p-3.5 sm:p-3 text-left"
            @click="desktopDropdownVisible = !desktopDropdownVisible"
          >
            <p class="text-sm leading-normal text-text-1 sm:text-base">
              {{ t('withdraw.select_network') }}
            </p>
            <div class="flex items-center">
              <span class="text-sm font-bold leading-normal text-text-1 sm:text-base">
                {{ accountName }}
              </span>
              <div
                class="ml-2 flex h-5 w-5 items-center justify-center rounded-md bg-opacity-10 text-text-1"
              >
                <ArrowDownIcon
                  class="h-5 w-5 transition-transform duration-200"
                  :class="{ 'rotate-180': desktopDropdownVisible }"
                />
              </div>
            </div>
          </button>
        </div>
        <div class="mt-2.5 rounded-lg bg-bg-2 p-3.5 sm:p-3">
          <p class="text-xs sm:text-sm leading-normal text-text-1">
            {{ t('withdraw.receiving_address_label') }}
          </p>
          <div
            class="mt-2.5 rounded-xl bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0 p-[14px]"
          >
            <input
              v-model="accountNo"
              type="text"
              :placeholder="t('withdraw.receive_address_input_placeholder')"
              class="w-full bg-transparent text-sm sm:text-base font-medium text-text-1 outline-none placeholder:text-text-3 placeholder:text-xs sm:placeholder:text-sm"
            />
          </div>
        </div>
      </div>

      <div v-if="option?.kind === 'fiat'">
        <div class="mt-2.5 rounded-lg bg-bg-2 p-4">
          <p class="text-xs sm:text-sm leading-normal text-text-1">
            {{ t('withdraw.account') }}
          </p>
          <div
            class="mt-2.5 rounded-xl bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0 p-[14px]"
          >
            <input
              v-model="accountNo"
              type="text"
              :placeholder="t('withdraw.account_placeholder')"
              class="w-full bg-transparent text-sm sm:text-base font-medium text-text-1 outline-none placeholder:text-text-3 placeholder:text-xs sm:placeholder:text-sm"
            />
          </div>
          <p class="mt-4 text-xs sm:text-sm leading-normal text-text-1">
            {{ t('withdraw.name') }}
          </p>
          <div
            class="mt-2.5 rounded-xl bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0 p-[14px]"
          >
            <input
              v-model="accountName"
              type="text"
              :placeholder="t('withdraw.name_placeholder')"
              class="w-full bg-transparent text-sm sm:text-base font-medium text-text-1 outline-none placeholder:text-text-3 placeholder:text-xs sm:placeholder:text-sm"
            />
          </div>
        </div>

        <p v-if="option?.kind === 'fiat'" class="mt-2.5 text-sm leading-normal text-text-3">
          {{ t('withdraw.e_wallet_notice') }}
        </p>
      </div>

      <button
        type="button"
        class="mt-6 flex h-10 sm:h-12 min-h-10 w-full shrink-0 items-center justify-center rounded-lg text-sm sm:text-base font-bold text-text-4"
        :class="canConfirm ? 'bg-theme-primary' : 'bg-theme-2 opacity-40 cursor-not-allowed'"
        :disabled="!canConfirm"
        @click="confirm"
      >
        {{ t('common.confirm') }}
      </button>
    </div>
  </PopShell>
  <Teleport to="body">
    <div
      v-if="option?.kind == 'crypto' && desktopDropdownVisible && !isMobile"
      class="fixed z-[1200] rounded-lg border border-opacity-5 bg-bg-2 p-3 shadow-lg"
      :style="desktopDropdownStyle"
    >
      <div class="space-y-2">
        <button
          v-for="item in option?.networks"
          :key="item.text"
          type="button"
          class="flex h-10 w-full items-center justify-between rounded-lg px-3 text-left lg:hover:bg-opacity-10"
          @click="selectNetwork(item.text)"
          :class="{ 'bg-opacity-10': accountName === item.text }"
        >
          <span class="text-sm font-bold leading-normal text-text-1">
            {{ item.text }}
          </span>
          <RadioCheckedIcon
            v-if="accountName === item.text"
            class="h-4 w-4 shrink-0 text-theme-primary"
          />
          <RadioUncheckedIcon v-else class="h-4 w-4 shrink-0 text-text-4" />
        </button>
      </div>
    </div>
  </Teleport>

  <PopShell
    v-model="networkListVisible"
    :transition-type="isMobile ? 'bottom-sheet' : 'modal'"
    @close="networkListVisible = false"
  >
    <div
      class="relative mx-auto flex w-full flex-col rounded-t-[12px] bg-bg-1 px-[14px] pb-5 pt-[14px] font-['Inter'] sm:w-[464px] sm:rounded-[24px] sm:p-8"
    >
      <div class="flex items-center justify-between">
        <h2 class="mx-auto text-xl font-bold leading-normal text-text-1 sm:mx-0">
          {{ t('withdraw.select_network') }}
        </h2>
        <button
          type="button"
          class="absolute right-4 top-4 hidden h-6 w-6 items-center justify-center rounded-md text-text-1 sm:flex"
          @click="networkListVisible = false"
        >
          <CloseIcon class="h-2.5 w-2.5" />
        </button>
      </div>

      <div class="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto">
        <button
          v-for="item in option?.networks"
          :key="item.text"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-[14px] py-3 text-left"
          @click="selectNetwork(item.text)"
          :class="{ 'bg-opacity-10': accountName === item.text }"
        >
          <p class="text-sm font-bold leading-normal text-text-1">
            {{ item.text }}
          </p>
          <RadioCheckedIcon
            v-if="accountName === item.text"
            class="h-5 w-5 shrink-0 text-theme-primary"
          />
          <RadioUncheckedIcon v-else class="h-5 w-5 shrink-0 text-text-4" />
        </button>
      </div>
    </div>
  </PopShell>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import CloseIcon from '@/static/svg/close.svg?component'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import PopShell from './popShell.vue'
import { AddAccountOption, PaymentMethodsOption } from './shared/usePaymentMethodsService'

interface Props {
  modelValue: boolean
  option?: PaymentMethodsOption
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  confirm: [value: AddAccountOption]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const { t } = useI18n()
const isMobile = useIsMobile()

const accountNo = ref<string>()
const accountName = ref<string>()
const defaultCryptoNetwork = computed(() => {
  if (props.option?.kind !== 'crypto') {
    return undefined
  }

  return props.option.networks?.[0]?.text
})
const canConfirm = computed(() => {
  return Boolean(accountNo.value && accountName.value)
})
const networkListVisible = ref(false)
const desktopDropdownVisible = ref(false)
const desktopTriggerRef = ref<HTMLElement | null>(null)
const desktopDropdownStyle = ref<Record<string, string>>({})

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const confirm = () => {
  const newData = {
    type: props.option?.channelType,
    cardType: props.option?.paymentCode,
    accountName: accountName.value,
    accountNo: accountNo.value
  } as AddAccountOption
  emit('confirm', newData)
}

const selectNetwork = (network: string) => {
  accountName.value = network
  desktopDropdownVisible.value = false
  networkListVisible.value = false
}

watch(
  () => props.modelValue,
  value => {
    if (!value) {
      networkListVisible.value = false
      desktopDropdownVisible.value = false
      accountNo.value = undefined
      accountName.value = undefined
    }
  }
)

watch(
  () => [props.modelValue, defaultCryptoNetwork.value] as const,
  ([isOpen, network]) => {
    if (isOpen && network) {
      accountName.value = network
    }
  },
  { immediate: true }
)

watch(desktopDropdownVisible, async value => {
  if (!value) {
    detachDesktopDropdownListeners()
    return
  }

  await nextTick()
  updateDesktopDropdownPosition()
  attachDesktopDropdownListeners()
})

const updateDesktopDropdownPosition = () => {
  const trigger = desktopTriggerRef.value

  if (!trigger) {
    return
  }

  const rect = trigger.getBoundingClientRect()

  desktopDropdownStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`
  }
}

const handleWindowChange = () => {
  if (!desktopDropdownVisible.value) {
    return
  }

  updateDesktopDropdownPosition()
}

const attachDesktopDropdownListeners = () => {
  window.addEventListener('resize', handleWindowChange)
  window.addEventListener('scroll', handleWindowChange, true)
}

const detachDesktopDropdownListeners = () => {
  window.removeEventListener('resize', handleWindowChange)
  window.removeEventListener('scroll', handleWindowChange, true)
}

onBeforeUnmount(() => {
  detachDesktopDropdownListeners()
})
</script>
