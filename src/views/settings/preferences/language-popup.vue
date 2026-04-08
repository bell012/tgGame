<template>
  <div>
    <transition name="popup-fade">
      <div v-show="visible" class="fixed inset-0 z-[999] bg-mask-60-1" @click.self="close" />
    </transition>
    <transition name="up-down">
      <div v-show="visible" class="fixed bottom-0 left-0 z-[999] w-full">
        <div class="rounded-t-xl bg-bg-1 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2.5">
          <div class="mb-3.5 flex items-center justify-between">
            <div></div>
            <div class="text-base font-bold text-text-1">Langanguage</div>
            <button
              type="button"
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
              type="button"
              class="flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left"
              :class="item.code === selectedLanguage ? 'bg-opacity-10' : ''"
              @click="handleSelect(item.code)"
            >
              <span class="text-sm font-[700] text-text-1">{{ item.label }}</span>
              <span
                class="flex h-5 w-5 items-center justify-center rounded-full border"
                :class="
                  item.code === selectedLanguage
                    ? 'border-theme-primary bg-theme-primary'
                    : 'border-opacity-30'
                "
              >
                <span
                  v-if="item.code === selectedLanguage"
                  class="h-2.5 w-2.5 rounded-full bg-common-100"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Locale } from '@/utils/locale'
import CloseIcon from '@/static/svg/close.svg?component'

defineProps<{
  visible: boolean
  selectedLanguage: Locale
  options: Array<{ code: Locale; label: string }>
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [value: Locale]
}>()

const close = () => emit('update:visible', false)

const handleSelect = (value: Locale) => {
  emit('select', value)
  close()
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;
</style>
