<template>
  <withdrawSelectableListPop
    v-model="visible"
    :title="t('withdraw.e_wallet_title')"
    :add-label="t('withdraw.add_e_wallet')"
    :items="selectableItems"
    :selected-id="selectedId"
    :icon="icon"
    @select="emit('select', $event)"
    @add="emit('add')"
    @close="emit('close')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FiatAccountItem } from './shared/useWithdrawFiat'
import withdrawSelectableListPop from './withdrawSelectableListPop.vue'

interface Props {
  modelValue: boolean
  items: FiatAccountItem[]
  selectedId?: string | null
  icon: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  add: []
  select: [id: string]
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const selectableItems = computed(() =>
  props.items.map(item => ({
    id: item.localId,
    title: item.accountNo ?? '',
    subtitle: item.accountName ?? ''
  }))
)
</script>
