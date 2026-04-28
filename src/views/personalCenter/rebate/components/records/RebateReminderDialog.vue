<template>
  <popShell v-model="visible" transition-type="modal">
    <section
      class="bg-bg-2 text-text-1"
      :class="
        isMobile
          ? 'mx-auto w-[328px] rounded-[18px] px-5 pb-5 pt-4 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
          : 'mx-auto w-[346px] rounded-[18px] px-5 pb-5 pt-4 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
      "
    >
      <div class="relative">
        <h3 class="pr-10 text-[18px] font-[700] leading-[22px] text-text-1">
          {{ t('rebatePage.records.reminderTitle') }}
        </h3>
        <button
          type="button"
          class="absolute right-0 top-0 flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-bg-3 text-text-1"
          @click="visible = false"
        >
          <CloseIcon class="h-4 w-4" />
        </button>
      </div>

      <p class="mt-5 text-[14px] leading-[22px] text-text-2">
        {{ message }}
      </p>

      <div v-if="isMobile" class="mt-6 space-y-3">
        <button
          type="button"
          class="h-[40px] w-full rounded-[8px] bg-theme-primary text-[16px] font-[700] text-text-4"
          @click="visible = false"
        >
          {{ t('common.confirm') }}
        </button>
        <button
          type="button"
          class="h-[40px] w-full rounded-[8px] bg-bg-3 text-[16px] font-[500] text-text-2"
          @click="visible = false"
        >
          {{ t('common.cancel') }}
        </button>
      </div>

      <div v-else class="mt-5 grid grid-cols-2 gap-4">
        <button
          type="button"
          class="h-[36px] rounded-[8px] bg-bg-3 text-[14px] font-[600] text-text-2"
          @click="visible = false"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="h-[36px] rounded-[8px] bg-theme-primary text-[14px] font-[700] text-text-4"
          @click="visible = false"
        >
          {{ t('common.confirm') }}
        </button>
      </div>
    </section>
  </popShell>
</template>

<script setup lang="ts">
import popShell from '@/components/withdraw/popShell.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  isMobile: boolean
  message: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})
</script>

<style scoped lang="scss"></style>
