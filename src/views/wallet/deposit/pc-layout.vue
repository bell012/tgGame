<template>
  <WalletLayout current-tab="deposit">
    <div class="overflow-hidden">
      <DepositPageContent
        mode="pc"
        :model-value="props.modelValue"
        :initial-method-code="props.initialMethodCode"
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
  initialMethodCode?: string
}

const props = defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: DepositTabType]
}>()
</script>
