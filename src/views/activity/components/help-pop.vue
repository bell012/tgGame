<template>
  <transition name="popup-fade">
    <div
      v-show="visible"
      class="fixed inset-0 z-[10011] flex items-end justify-center bg-mask-60-1 px-4 sm:items-center"
      @click.self="handleClose"
    >
      <section
        class="mb-4 w-full max-w-[340px] rounded-[18px] bg-bg-1 px-6 pb-6 pt-6 sm:mb-0"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-start justify-between gap-4">
          <h3 class="text-[20px] font-[700] leading-[24px] text-text-1">
            {{ t('ticketPage.taskPop.title') }}
          </h3>
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white/10"
            :aria-label="t('ticketPage.taskPop.closeAriaLabel')"
            @click="handleClose"
          >
            <CloseIcon class="h-2.5 w-2.5 text-text-1" />
          </button>
        </div>

        <div class="mt-6 flex flex-col gap-5">
          <div v-for="section in displaySections" :key="section.title">
            <h4 class="text-[17px] font-[400] leading-[21px] text-theme-primary">
              {{ section.title }}:
            </h4>
            <p class="mt-4 whitespace-pre-line text-[16px] font-[400] leading-[22px] text-text-2">
              {{ section.content }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="mt-8 flex h-[46px] w-full items-center justify-center rounded-[8px] bg-theme-primary text-[15px] font-[700] text-text-4"
          @click="handleClose"
        >
          {{ t('ticketPage.taskPop.gotIt') }}
        </button>
      </section>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CloseIcon from '@/static/svg/close.svg?component'
import { useI18n } from 'vue-i18n'

interface HelpPopSection {
  title: string
  content: string
}

interface Props {
  title?: string
  content?: string
  sections?: HelpPopSection[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  content: '',
  sections: () => []
})

const visible = defineModel<boolean>('visible', { default: false })
const { t } = useI18n()

const displaySections = computed<HelpPopSection[]>(() => {
  return props.sections.length > 0
    ? props.sections
    : [{ title: props.title, content: props.content }]
})

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.24s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
</style>
