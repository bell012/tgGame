<template>
  <popShell v-model="visible" transition-type="modal">
    <section
      class="mx-auto flex h-[704px] w-[480px] flex-col overflow-hidden rounded-[12px] bg-bg-1 shadow-[0_18px_54px_rgba(0,0,0,0.32)]"
    >
      <div class="relative flex items-center justify-center bg-bg-2 px-4 py-3">
        <h3 class="text-[16px] font-[700] leading-[20px] text-text-1">
          {{ t('rebatePage.records.title') }}
        </h3>
        <button
          type="button"
          class="absolute right-4 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-[8px] bg-white/10 text-text-1"
          @click="visible = false"
        >
          <CloseIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="records-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <RebateRecordsContent panel-mode />
      </div>
    </section>
  </popShell>
</template>

<script setup lang="ts">
import popShell from '@/components/withdraw/popShell.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RebateRecordsContent from '../records/RebateRecordsContent.vue'

const { t } = useI18n()

const props = defineProps<{
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

<style scoped lang="scss">
.records-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}
</style>
