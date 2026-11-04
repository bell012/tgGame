<template>
  <p class="text-center text-[14px] leading-[20px] text-text-3">
    <template v-if="error">
      {{ t('redPacketPanel.loadFailed') }}
      <button type="button" class="ml-[4px] text-secondary-9" @click="emit('retry')">
        {{ t('redPacketPanel.retry') }}
      </button>
    </template>
    <template v-else>{{ emptyText }}</template>
  </p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  error?: boolean
  emptyText?: string
}>()

const emit = defineEmits<{ retry: [] }>()

const { t } = useI18n()
</script>
