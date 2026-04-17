<template>
  <withdrawFormPop
    v-model="visible"
    :title="t('withdraw.add_address', { currency: currencyCode })"
    :fields="fields"
    :form-value="formValue"
    :top-info="topInfo"
    @update:form-value="handleFormValueUpdate"
    @close="emit('close')"
    @confirm="emit('confirm')"
  >
    <template #extra-content>
      <button
        v-if="isMobile"
        type="button"
        class="mt-2.5 flex w-full items-center justify-between rounded-lg bg-bg-2 p-4 text-left"
        @click="networkListVisible = true"
      >
        <div class="flex w-full items-center justify-between">
          <p class="text-sm sm:text-base leading-normal text-text-1">
            {{ t('withdraw.select_network') }}
          </p>
          <div class="flex items-center">
            <span class="text-sm sm:text-base font-bold leading-normal text-text-1">
              {{ network }}
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
          class="flex w-full items-center justify-between rounded-lg bg-bg-2 p-4 text-left"
          @click="desktopDropdownVisible = !desktopDropdownVisible"
        >
          <p class="text-sm leading-normal text-text-1 sm:text-base">
            {{ t('withdraw.select_network') }}
          </p>
          <div class="flex items-center">
            <span class="text-sm font-bold leading-normal text-text-1 sm:text-base">
              {{ network }}
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
    </template>
  </withdrawFormPop>

  <Teleport to="body">
    <div
      v-if="desktopDropdownVisible && !isMobile"
      class="fixed z-[1200] rounded-lg border border-opacity-5 bg-bg-2 p-3 shadow-lg"
      :style="desktopDropdownStyle"
    >
      <div class="space-y-2">
        <button
          v-for="item in networkOptions"
          :key="item.value"
          type="button"
          class="flex h-10 w-full items-center justify-between rounded-lg px-3 text-left lg:hover:bg-opacity-10"
          @click="handleDesktopNetworkSelect(item.value)"
          :class="{ 'bg-opacity-10': network === item.value }"
        >
          <span class="text-sm font-bold leading-normal text-text-1">
            {{ item.label }}
          </span>
          <RadioCheckedIcon
            v-if="network === item.value"
            class="h-4 w-4 shrink-0 text-theme-primary"
          />
          <RadioUncheckedIcon v-else class="h-4 w-4 shrink-0 text-text-4" />
        </button>
      </div>
    </div>
  </Teleport>

  <withdrawCryptoNetworkListPop
    v-if="isMobile"
    v-model="networkListVisible"
    :title="t('withdraw.select_network')"
    :items="networkOptions"
    :selected-value="network"
    @select="handleSelectNetwork"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import withdrawFormPop from './withdrawFormPop.vue'
import withdrawCryptoNetworkListPop from './withdrawCryptoNetworkListPop.vue'
import type { WithdrawCryptoNetworkOption } from './withdrawCryptoNetworkListPop.vue'

interface Props {
  modelValue: boolean
  currencyCode: string
  network: string
  icon: string
  inputValue: string
  networkOptions: WithdrawCryptoNetworkOption[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:inputValue': [value: string]
  'update:network': [value: string]
  close: []
  confirm: []
}>()

const { t } = useI18n()
const isMobile = useIsMobile()
const networkListVisible = ref(false)
const desktopDropdownVisible = ref(false)
const desktopTriggerRef = ref<HTMLElement | null>(null)
const desktopDropdownStyle = ref<Record<string, string>>({})

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

watch(
  () => props.modelValue,
  value => {
    if (!value) {
      networkListVisible.value = false
      desktopDropdownVisible.value = false
    }
  }
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

const formValue = computed(() => ({
  inputValue: props.inputValue
}))

const fields = computed(() => [
  {
    key: 'inputValue',
    label: t('withdraw.receiving_address_label', { currency: props.currencyCode }),
    placeholder: t('withdraw.receive_address_input_placeholder', { currency: props.currencyCode })
  }
])

const topInfo = computed(() => ({
  label: t('withdraw.crypto'),
  value: props.currencyCode,
  icon: props.icon
}))

const handleFormValueUpdate = (value: Record<string, string>) => {
  emit('update:inputValue', value.inputValue ?? '')
}

const handleSelectNetwork = (value: string) => {
  emit('update:network', value)
}

const handleDesktopNetworkSelect = (value: string) => {
  emit('update:network', value)
  desktopDropdownVisible.value = false
}

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
