<template>
  <div
    v-if="variant === 'mobile-bar'"
    class="flex shrink-0 items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+8px)]"
  >
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center text-[18px] text-common-100 disabled:opacity-40"
      :disabled="isInteractionLocked"
      :aria-label="t('common.cancel')"
      @click="emit('close')"
    >
      ✕
    </button>
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center text-[18px] text-common-80 disabled:opacity-40"
      :disabled="isInteractionLocked"
      :aria-label="t('luckySpinPage.reminder.title')"
      @click="emit('open-reminder')"
    >
      ?
    </button>
  </div>

  <button
    v-else-if="variant === 'pc-close'"
    type="button"
    class="pc-modal-control absolute right-4 top-4 z-20 flex items-center justify-center text-[18px] text-common-100 disabled:opacity-40"
    :style="controlBtnStyle"
    :disabled="isInteractionLocked"
    :aria-label="t('common.cancel')"
    @click="emit('close')"
  >
    ✕
  </button>

  <button
    v-else-if="variant === 'pc-help'"
    type="button"
    class="pc-modal-control absolute left-4 top-4 z-10 flex items-center justify-center border-0 p-0 disabled:opacity-40"
    :style="controlBtnStyle"
    :disabled="isInteractionLocked"
    :aria-label="t('luckySpinPage.reminder.title')"
    @click="emit('open-help')"
  >
    <img
      :src="LUCKY_SPIN_ASSETS.controls.modalHelpIcon"
      alt=""
      class="shrink-0 select-none"
      :style="helpIconStyle"
      draggable="false"
    />
  </button>
</template>

<script setup lang="ts">
import { LUCKY_SPIN_ASSETS } from '../../shared/assets'
import type { CSSProperties } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  variant: 'mobile-bar' | 'pc-close' | 'pc-help'
  isInteractionLocked: boolean
  controlBtnStyle?: CSSProperties
  helpIconStyle?: CSSProperties
}>()

const emit = defineEmits<{
  close: []
  'open-reminder': []
  'open-help': []
}>()

const { t } = useI18n()
</script>
