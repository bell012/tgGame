<template>
  <div
    class="fixed inset-0 z-[10011] flex items-center justify-center bg-mask-60-1 p-4"
    @click.self="$emit('close')"
  >
    <section
      class="flex max-h-[calc(100dvh-32px)] w-full max-w-[340px] flex-col overflow-hidden rounded-[18px] bg-bg-1 p-6 sm:max-w-[480px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="check-in-rules-title"
    >
      <div class="flex shrink-0 items-start justify-between gap-4">
        <h3 id="check-in-rules-title" class="text-[20px] font-[700] leading-8 text-text-1">
          {{ t('checkIn.rulesTitle') }}
        </h3>
        <button
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white/10"
          :aria-label="t('checkIn.rulesCloseAriaLabel')"
          @click="$emit('close')"
        >
          <CloseIcon class="h-2.5 w-2.5 text-text-1" />
        </button>
      </div>

      <div
        class="mt-6 min-h-0 overflow-y-auto overscroll-contain break-words text-sm leading-relaxed text-text-2"
      >
        <div v-if="isHtml" class="check-in-rules-html" v-html="content" />
        <p v-else class="whitespace-pre-wrap">{{ content || t('checkIn.rulesEmpty') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ content: string }>()
defineEmits<{ close: [] }>()
const { t } = useI18n()

// 与活动详情保持一致，后台规则支持富文本和纯文本。
const isHtml = computed(() => props.content.includes('<') && props.content.includes('>'))
</script>

<style scoped>
.check-in-rules-html :deep(img) {
  max-width: 100%;
  height: auto;
}

.check-in-rules-html :deep(ul) {
  padding-left: 1.5em;
  list-style: disc;
}

.check-in-rules-html :deep(ol) {
  padding-left: 1.5em;
  list-style: decimal;
}
</style>
