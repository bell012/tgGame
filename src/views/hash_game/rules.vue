<template>
  <!-- pc和H5共用游戏规则 -->
  <Teleport to="body" :disabled="variant === 'h5'">
    <Transition name="bottom-sheet">
      <div
        v-if="variant === 'h5' || visible"
        :class="
          variant === 'pc'
            ? 'fixed inset-0 z-[1100] grid place-items-center bg-mask-60-1 p-[12px]'
            : 'fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1'
        "
        @click.self="close"
        @keydown.esc.stop.prevent="close"
      >
        <section
          :class="
            variant === 'pc'
              ? 'flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[8px] bg-bg-1 text-text-1'
              : 'flex min-h-0 flex-1 flex-col overflow-hidden bg-bg-1'
          "
          :role="variant === 'pc' ? 'dialog' : undefined"
          :aria-modal="variant === 'pc' ? 'true' : undefined"
          :aria-labelledby="variant === 'pc' ? 'hash-game-rules-title' : undefined"
        >
          <header
            v-if="variant === 'pc'"
            class="grid h-[56px] shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-bg-2 px-[16px]"
          >
            <span aria-hidden="true" />
            <h2 id="hash-game-rules-title" class="text-[18px] font-[700] text-text-1">
              {{ t('hashGame.gameRules') }}
            </h2>
            <button
              type="button"
              class="ml-auto grid size-[24px] place-items-center rounded-[4px] bg-opacity-10"
              :aria-label="t('common.close')"
              @click="close"
            >
              <CloseIcon class="size-[12px] text-icon-1" />
            </button>
          </header>
          <H5Header v-else :title="t('hashGame.gameRules')" />

          <main
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            :class="variant === 'pc' ? 'px-[16px] py-[16px]' : 'px-[12px] py-[12px]'"
          >
            <div
              :class="
                variant === 'pc'
                  ? 'mb-[20px] flex items-center gap-[8px]'
                  : 'mb-[20px] flex items-center gap-[10px]'
              "
              role="tablist"
              :aria-label="t('hashGame.gameRules')"
            >
              <button
                v-for="period in periodOptions"
                :key="period"
                type="button"
                role="tab"
                class=""
                :class="[
                  variant === 'pc'
                    ? 'h-[32px] rounded-[16px] px-[24px] text-[14px]'
                    : 'h-[30px] rounded-[8px] px-[6px] text-[13px]',
                  {
                    'bg-theme-primary font-[600] text-text-4': selectedPeriod === period,
                    'bg-bg-2 font-[400] text-text-2': selectedPeriod !== period
                  }
                ]"
                :aria-selected="selectedPeriod === period"
                @click="selectedPeriod = period"
              >
                {{ period }}s Hash
              </button>
            </div>

            <div class="overflow-hidden">
              <img
                :src="rulesImage"
                :alt="t('hashGame.gameRules')"
                class="block h-auto w-full rounded-[8px] object-contain"
              />
            </div>
          </main>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import rulesImage from '@/static/img/1125.png'
import { HASH_GAME_PERIOD_OPTIONS } from './index'

const props = withDefaults(defineProps<{ variant?: 'h5' | 'pc' }>(), {
  variant: 'h5'
})
const visible = defineModel<boolean>('visible', { default: false })
const selectedPeriod = defineModel<number>('selectedPeriod', {
  default: HASH_GAME_PERIOD_OPTIONS[0]
})

const { t } = useI18n()
const periodOptions = HASH_GAME_PERIOD_OPTIONS

const close = () => {
  if (props.variant === 'pc') visible.value = false
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (props.variant === 'pc' && visible.value && event.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', handleDocumentKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleDocumentKeydown))
</script>
