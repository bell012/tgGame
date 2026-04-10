<template>
  <div>
    <transition name="popup-fade">
      <div v-show="visible" class="fixed inset-0 z-[999] bg-mask-60-1" @click.self="close" />
    </transition>
    <transition name="up-down">
      <div v-show="visible" class="fixed left-0 bottom-0 z-[999] w-full">
        <div class="rounded-t-xl bg-bg-1 px-3 pb-10 pt-2.5">
          <div class="flex items-center justify-between">
            <div></div>
            <div class="text-base font-bold text-text-1">{{ t('personalCenter.currency') }}</div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-md bg-opacity-10"
              @click="close"
            >
              <CloseIcon class="h-3 w-3 text-text-1" />
            </button>
          </div>

          <div class="mt-5">
            <div class="text-xs font-[700] text-text-2 mb-2.5">Cash</div>
            <button
              v-for="item in options"
              :key="item.code"
              class="flex w-full h-[42px] items-center justify-between rounded-lg px-2.5 text-left"
              :class="item.code === selectedCurrency ? 'bg-opacity-10' : ''"
              @click="handleSelect(item.code)"
            >
              <div class="w-full flex items-center justify-between">
                <div class="flex items-center">
                  <img
                    :src="getCurrencyImageByCode(item.code)"
                    :alt="item.code"
                    class="w-5 h-5 object-cover"
                  />
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
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import { getCurrencyImageByCode } from '@/utils/locale'

defineProps<{
  visible: boolean
  selectedCurrency: string
  options: Array<{ code: string; balanceText: string }>
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [value: string]
}>()

const { t } = useI18n()

const close = () => emit('update:visible', false)

const handleSelect = (value: string) => {
  emit('select', value)
  close()
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;
</style>
