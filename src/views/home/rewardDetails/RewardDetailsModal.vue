<template>
  <Teleport to="body">
    <div
      v-if="modelValue && reward"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-mask-60-1 sm:flex"
      @click.self="closeModal"
    >
      <div
        class="relative max-h-[90vh] w-[min(420px,92vw)] overflow-y-auto overscroll-contain rounded-lg bg-bg-1 shadow-xl"
      >
        <div
          class="sticky top-0 z-[1] flex h-11 shrink-0 items-center justify-center rounded-t-lg bg-bg-2 px-10"
        >
          <button
            type="button"
            class="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded bg-opacity-10"
            @click="closeModal"
          >
            <Close class="h-3 w-3 text-text-1" />
          </button>
          <h3 class="text-center text-base font-bold text-text-1">
            {{ t('rewardDetails.title') }}
          </h3>
        </div>
        <div class="h-[570px]">
          <Details :reward-data="reward" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Close from '@/static/svg/close.svg?component'
import Details from './details.vue'
import type { RewardDetailsState } from './types'

const { t } = useI18n()

defineProps<{
  modelValue: boolean
  reward: RewardDetailsState | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>
