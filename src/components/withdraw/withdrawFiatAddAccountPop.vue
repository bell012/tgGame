<template>
  <withdrawFormPop
    v-model="visible"
    :title="t('withdraw.add_e_wallet')"
    :fields="fields"
    :form-value="formValue"
    :notice="t('withdraw.e_wallet_notice')"
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
  accountNo: string
  accountName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:accountNo': [value: string]
  'update:accountName': [value: string]
  close: []
  confirm: []
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const formValue = computed(() => ({
  accountNo: props.accountNo,
  accountName: props.accountName
}))

const fields = computed(() => [
  {
    key: 'accountNo',
    label: t('withdraw.account'),
    placeholder: t('withdraw.account_placeholder')
  },
  {
    key: 'accountName',
    label: t('withdraw.name'),
    placeholder: t('withdraw.name_placeholder')
  }
])

const handleFormValueUpdate = (value: Record<string, string>) => {
  emit('update:accountNo', value.accountNo ?? '')
  emit('update:accountName', value.accountName ?? '')
}
</script>
