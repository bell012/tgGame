<template>
  <withdrawSelectableListPop
    v-model="visible"
    :title="t('withdraw.address_list_title', { currency: currencyCode })"
    :add-label="t('withdraw.add_address', { currency: currencyCode })"
    :items="selectableItems"
    :selected-id="selectedId"
    :icon="icon"
    :show-add-button="showAddButton"
    :desktop-dropdown-height="180"
    @select="emit('select', $event)"
    @add="emit('add')"
    @close="emit('close')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CryptoReceiveAddressItem } from './shared/useWithdrawCrypto'
import withdrawSelectableListPop from './withdrawSelectableListPop.vue'

interface Props {
  modelValue: boolean
  items: CryptoReceiveAddressItem[]
  selectedId?: string | null
  currencyCode: string
  icon: string
  showAddButton?: boolean
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
    id: item.id,
    title: item.address,
    subtitle: `${props.currencyCode}-${item.network}`
  }))
)
</script>
