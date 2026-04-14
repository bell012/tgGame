<template>
  <div>
    <transition name="popup-fade">
      <div v-show="visible" class="fixed inset-0 z-[999] bg-mask-60-1" @click.self="close" />
    </transition>
    <transition name="up-down">
      <div v-show="visible" class="fixed left-0 bottom-0 z-[999] w-full">
        <div class="rounded-t-xl bg-bg-1 px-3 pb-2.5 pt-2.5">
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

          <CurrencySelectorList
            :visible="props.visible"
            :options="listOptions"
            :selected-value="props.selectedCurrency"
            mode="balance"
            section-label="Cash"
            list-class="mt-5 max-h-[55vh] overflow-y-auto overscroll-contain pr-0.5"
            item-class="flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left"
            selected-item-class="bg-opacity-10"
            icon-class="h-5 w-5 object-contain"
            @select="handleSelect"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CurrencySelectorList from '@/components/common/currency-selector/index.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import { getCurrencyIconByCode } from '@/components/common/currency-selector/currency-select-options'

const props = defineProps<{
  visible: boolean
  selectedCurrency: string
  options: Array<{ code: string; balanceText: string; icon?: string }>
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [value: string]
}>()

const { t } = useI18n()

const listOptions = computed(() => {
  return props.options.map(item => ({
    value: item.code,
    label: item.code,
    icon: item.icon || getCurrencyIconByCode(item.code),
    trailingText: item.balanceText
  }))
})

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
