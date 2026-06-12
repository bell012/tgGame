<template>
  <div
    v-if="state === 'loading'"
    class="flex items-center justify-center text-common-60"
    :class="layout === 'mobile' ? 'min-h-0 flex-1' : ''"
    :style="layout === 'desktop' ? panelStyle : undefined"
  >
    {{ t('common.loading') }}
  </div>
  <div
    v-else
    class="flex flex-col items-center justify-center gap-4 px-6 text-center text-common-60"
    :class="layout === 'mobile' ? 'min-h-0 flex-1' : ''"
    :style="layout === 'desktop' ? panelStyle : undefined"
  >
    <p class="text-[14px]">{{ t('luckySpinPage.loadFailed') }}</p>
    <button
      type="button"
      class="rounded-[10px] bg-theme-primary px-6 py-2 text-[14px] font-[700] text-text-4"
      @click="emit('retry')"
    >
      {{ t('luckySpinPage.retry') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  state: 'loading' | 'error'
  layout: 'mobile' | 'desktop'
  panelStyle?: CSSProperties
}>()

const emit = defineEmits<{ retry: [] }>()

const { t } = useI18n()
</script>
