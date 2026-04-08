<template>
  <div>
    <transition name="popup-fade">
      <div v-show="visible" class="fixed inset-0 z-[999] bg-mask-60-1" @click.self="close" />
    </transition>
    <transition name="up-down">
      <div v-show="visible" class="fixed bottom-0 left-0 z-[999] w-full">
        <div
          class="currency-drawer flex flex-col overflow-hidden rounded-t-xl bg-bg-1 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2.5"
        >
          <div class="flex items-center justify-between">
            <div></div>
            <div class="text-base font-bold text-text-1">Currency</div>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-md bg-opacity-10"
              @click="close"
            >
              <CloseIcon class="h-3 w-3 text-text-1" />
            </button>
          </div>

          <div class="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
            <div class="mb-2.5 text-xs font-[700] text-text-2">Cash</div>
            <button
              v-for="item in options"
              :key="item.code"
              type="button"
              class="flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left"
              :class="item.code === selectedCurrency ? 'bg-opacity-10' : ''"
              @click="handleSelect(item.code)"
            >
              <div class="flex w-full items-center justify-between">
                <div class="flex items-center">
                  <img :src="item.icon" :alt="item.code" class="h-5 w-5 object-contain" />
                  <span class="ml-2.5 text-sm font-[700] text-text-1">{{ item.code }}</span>
                </div>
                <div class="text-xs font-[500] text-text-1">{{ item.balanceText }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'

defineProps<{
  visible: boolean
  selectedCurrency: string
  options: Array<{
    code: string
    icon: string
    balanceText: string
  }>
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [value: string]
}>()

const close = () => emit('update:visible', false)

const handleSelect = (value: string) => {
  emit('select', value)
  close()
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;

.currency-drawer {
  height: 55vh !important;
  max-height: 55vh !important;
}
</style>
