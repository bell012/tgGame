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
    </template>
  </withdrawFormPop>

  <withdrawCryptoNetworkListPop
    v-model="networkListVisible"
    :title="t('withdraw.select_network')"
    :items="networkOptions"
    :selected-value="network"
    @select="handleSelectNetwork"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
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
const networkListVisible = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
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
</script>
