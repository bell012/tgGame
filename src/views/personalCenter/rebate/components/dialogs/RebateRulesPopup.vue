<template>
  <popShell v-model="visible" :transition-type="isMobile ? 'bottom-sheet' : 'modal'">
    <section
      class="bg-bg-2 text-text-1"
      :class="
        isMobile
          ? 'w-full max-h-[calc(100dvh-120px)] overflow-y-auto rounded-t-[18px] px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4'
          : 'mx-auto max-h-[70vh] w-[420px] max-w-[calc(100vw-40px)] overflow-y-auto rounded-[12px] px-4 pb-5 pt-3 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
      "
    >
      <div class="relative flex items-center justify-center">
        <h3
          class="text-center font-[700] text-text-1"
          :class="isMobile ? 'text-[20px] leading-[24px]' : 'text-[16px] leading-[20px]'"
        >
          {{ t('rebatePage.rulesPopup.title') }}
        </h3>
        <button
          type="button"
          class="absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[10px] bg-bg-3 text-text-1"
          :class="isMobile ? 'h-[40px] w-[40px]' : 'h-[28px] w-[28px]'"
          @click="visible = false"
        >
          <CloseIcon :class="isMobile ? 'h-5 w-5' : 'h-4 w-4'" />
        </button>
      </div>

      <div class="mt-6 space-y-6">
        <section v-for="section in sections" :key="section.title">
          <h4 class="font-[700] text-text-1 text-[14px] leading-[20px]">
            {{ section.title }}
          </h4>
          <p
            v-if="section.content"
            class="mt-2 whitespace-pre-line text-text-2"
            :class="isMobile ? 'text-[12px] leading-[18px]' : 'text-[14px] leading-[22px]'"
          >
            {{ section.content }}
          </p>
          <ul
            v-if="section.items?.length"
            class="rebate-rules-list mt-2 text-text-2"
            :class="isMobile ? 'text-[12px] leading-[18px]' : 'text-[14px] leading-[22px]'"
          >
            <li v-for="item in section.items" :key="item">
              {{ item }}
            </li>
          </ul>
        </section>
      </div>
    </section>
  </popShell>
</template>

<script setup lang="ts">
import popShell from '@/components/withdraw/popShell.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RebateRuleSection } from '../../types'

const { t } = useI18n()

const props = defineProps<{
  isMobile: boolean
  modelValue: boolean
  sections: RebateRuleSection[]
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
.rebate-rules-list {
  padding-left: 18px;
  list-style: disc;
}
</style>
