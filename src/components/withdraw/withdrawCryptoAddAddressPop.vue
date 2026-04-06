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
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import withdrawFormPop from './withdrawFormPop.vue'

interface Props {
  modelValue: boolean
  currencyCode: string
  icon: string
  inputValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:inputValue': [value: string]
  close: []
  confirm: []
}>()

const { t } = useI18n()

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
</script>
