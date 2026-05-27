<template>
  <WalletLayout current-tab="deposit">
    <div class="overflow-hidden">
      <DepositPageContent
        mode="pc"
        :model-value="props.modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
  </WalletLayout>
</template>

<script setup lang="ts">
import WalletLayout from '../index.vue'
import DepositPageContent from './components/DepositPageContent.vue'
import type { DepositTabType } from './shared'

interface Props {
  modelValue: DepositTabType
}

const props = defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: DepositTabType]
}>()
</script>
