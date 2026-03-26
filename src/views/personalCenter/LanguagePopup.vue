<template>
  <div>
    <transition name="popup-fade">
      <div v-show="visible" class="fixed inset-0 z-[99] bg-mask-60-1" @click.self="close" />
    </transition>
    <transition name="up-down">
      <div v-show="visible" class="fixed left-0 bottom-0 z-[99] w-full">
        <div class="rounded-t-xl bg-bg-1 px-3 pb-10 pt-2.5">
          <div class="mb-3.5 flex items-center justify-between">
            <div></div>
            <div class="text-base font-bold text-text-1">{{ t('personalCenter.language') }}</div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-md bg-opacity-10"
              @click="close"
            >
              <CloseIcon class="h-3 w-3 text-text-1" />
            </button>
          </div>

          <div class="space-y-2.5">
            <button
              v-for="item in options"
              :key="item.code"
              class="flex w-full h-[42px] items-center justify-between rounded-lg px-2.5 text-left"
              :class="item.code === selectedLanguage ? 'bg-opacity-10' : ''"
              @click="handleSelect(item.code)"
            >
              <span class="text-sm font-[700] text-text-1">{{ item.label }}</span>
              <component
                :is="item.code === selectedLanguage ? DropdownSelectionIcon : DropdownDefaultIcon"
                class="h-5 w-5"
              />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Locale } from '@/utils/locale'
import CloseIcon from '@/static/svg/close.svg?component'
import DropdownDefaultIcon from '@/static/svg/drop_down _default.svg?component'
import DropdownSelectionIcon from '@/static/svg/drop_down _selection.svg?component'

const props = defineProps<{
  visible: boolean
  selectedLanguage: Locale
  options: Array<{ code: Locale; label: string }>
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [value: Locale]
}>()

const { t } = useI18n()
const CLOSE_ANIMATION_MS = 300
let selectTimer: ReturnType<typeof window.setTimeout> | any = null

const close = () => emit('update:visible', false)

const handleSelect = (value: Locale) => {
  close()

  if (value === props.selectedLanguage) {
    return
  }

  if (selectTimer) {
    window.clearTimeout(selectTimer)
  }

  selectTimer = window.setTimeout(() => {
    emit('select', value)
    selectTimer = null
  }, CLOSE_ANIMATION_MS)
}

onBeforeUnmount(() => {
  if (selectTimer) {
    window.clearTimeout(selectTimer)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;
</style>
