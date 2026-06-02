<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10010] bg-mask-60-1"
          @click.self="handleClose"
        />
      </transition>

      <transition name="sheet-transition">
        <div
          v-show="visible"
          class="fixed inset-x-0 bottom-0 z-[10011] mx-auto max-w-[480px] rounded-t-[20px] bg-bg-2 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-5"
        >
          <h3 class="text-center text-[18px] font-[700] text-text-1">
            {{ t('luckySpinPage.reminder.title') }}
          </h3>

          <ul class="mt-4 flex flex-col gap-3">
            <li v-for="task in tasks" :key="task.id" class="rounded-[10px] bg-bg-1 px-3 py-3">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[14px] font-[500] text-text-1">{{ task.title }}</span>
                <button
                  v-if="!task.finished && task.actionType === 'deposit'"
                  type="button"
                  class="shrink-0 rounded-[6px] bg-theme-primary px-3 py-1 text-[12px] font-[700] text-text-4"
                  @click="emit('deposit')"
                >
                  {{ t('luckySpinPage.reminder.deposit') }}
                </button>
                <span
                  v-else-if="task.finished"
                  class="shrink-0 text-[12px] font-[500] text-common-60"
                >
                  {{ t('luckySpinPage.reminder.finished') }}
                </span>
              </div>
              <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-common-10">
                <div
                  class="h-full rounded-full bg-theme-primary transition-all"
                  :style="{ width: `${task.progress}%` }"
                />
              </div>
            </li>
          </ul>

          <div class="mt-4">
            <h4 class="text-[14px] font-[700] text-text-1">
              {{ t('luckySpinPage.reminder.rulesTitle') }}
            </h4>
            <ol class="mt-2 list-decimal space-y-1 pl-4 text-[12px] leading-[18px] text-text-2">
              <li v-for="(rule, index) in rules" :key="index">{{ rule }}</li>
            </ol>
          </div>

          <button
            type="button"
            class="mt-5 flex h-[44px] w-full items-center justify-center rounded-[10px] bg-theme-primary text-[15px] font-[700] text-text-4"
            @click="handleClose"
          >
            {{ t('luckySpinPage.result.ok') }}
          </button>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { LuckySpinTask } from '../../shared/types'
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  tasks: LuckySpinTask[]
  rules: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  deposit: []
}>()

const { t } = useI18n()

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.popup-fade-enter-active,
.popup-fade-leave-active,
.sheet-transition-enter-active,
.sheet-transition-leave-active {
  transition: opacity 0.24s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.sheet-transition-enter-active,
.sheet-transition-leave-active {
  transition: transform 0.28s ease;
}

.sheet-transition-enter-from,
.sheet-transition-leave-to {
  transform: translateY(100%);
}
</style>
