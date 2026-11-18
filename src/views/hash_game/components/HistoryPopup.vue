<template>
  <!-- 历史记录弹窗 -->
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="visible"
        :class="
          variant === 'pc'
            ? 'fixed inset-0 z-[1000] grid place-items-center bg-mask-60-1 p-[12px]'
            : 'fixed inset-0 z-[1000] flex items-end bg-mask-60-1'
        "
        @click.self="emit('update:visible', false)"
        @keydown.esc.stop.prevent="emit('update:visible', false)"
      >
        <section
          class="bottom-sheet-panel flex flex-col overflow-hidden bg-bg-1 text-text-1"
          :class="
            variant === 'pc'
              ? 'max-h-[85vh] w-full max-w-[480px] rounded-[8px]'
              : 'h-[70vh] w-full rounded-[12px] px-[12px] py-[12px]'
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="hash-game-history-title"
        >
          <header
            v-if="variant === 'pc'"
            class="grid h-[56px] shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-bg-2 px-[16px]"
          >
            <span aria-hidden="true" />
            <h2 id="hash-game-history-title" class="text-[18px] font-[700] text-text-1">
              {{ t('hashGame.history') }}
            </h2>
            <button
              type="button"
              class="ml-auto grid size-[24px] place-items-center rounded-[4px] bg-opacity-10"
              :aria-label="t('common.close')"
              @click="emit('update:visible', false)"
            >
              <CloseIcon class="size-[12px] text-icon-1" />
            </button>
          </header>
          <h2
            v-else
            id="hash-game-history-title"
            class="mb-[12px] flex shrink-0 items-center justify-center text-[19px] font-[600] text-text-1"
          >
            {{ t('hashGame.history') }}
          </h2>

          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            :class="variant === 'pc' ? 'px-[16px] py-[16px]' : ''"
          >
            <div
              :class="
                variant === 'pc'
                  ? 'grid grid-cols-[0.8fr_1.2fr_1.2fr_0.8fr] items-center rounded-t-[12px] bg-bg-3 px-[12px] py-[8px] text-center text-[14px] text-text-2'
                  : 'grid grid-cols-[0.8fr_1.2fr_1.2fr_0.8fr] items-center rounded-t-[8px] bg-bg-3 px-[12px] py-[6px] text-center text-[11px] text-text-2'
              "
            >
              <span class="text-left">{{ t('hashGame.betBlock') }}</span>
              <span>{{ t('hashGame.result') }}</span>
              <span>{{ t('hashGame.blockHash') }}</span>
              <span class="text-right">{{ t('hashGame.actions') }}</span>
            </div>
            <div
              :class="
                variant === 'pc'
                  ? 'bg-bg-2 rounded-b-[12px] overflow-hidden'
                  : 'bg-bg-2 rounded-b-[8px] overflow-hidden'
              "
            >
              <div
                v-for="(record, index) in records"
                :key="record.id"
                :class="[
                  variant === 'pc'
                    ? 'grid grid-cols-[0.8fr_1.2fr_1.2fr_0.8fr] items-center px-[12px] py-[12px] text-center text-[16px] text-text-2'
                    : 'grid grid-cols-[0.8fr_1.2fr_1.2fr_0.8fr] items-center px-[12px] py-[7px] text-center text-[12px] text-text-2',
                  index % 2 === 0 ? 'bg-bg-2' : 'bg-bg-3'
                ]"
              >
                <span class="text-left">{{ record.block }}</span>
                <span
                  :class="
                    variant === 'pc'
                      ? 'flex items-center justify-center gap-[6px]'
                      : 'flex items-center justify-center gap-[7px]'
                  "
                >
                  <b class="text-theme-primary">
                    {{ record.digit }}
                  </b>
                  <span
                    :class="
                      variant === 'pc'
                        ? 'h-[16px] w-px shrink-0 bg-opacity-6'
                        : 'h-[15px] w-px shrink-0 bg-opacity-6'
                    "
                    aria-hidden="true"
                  />
                  <span :class="variant === 'pc' ? 'flex gap-[4px]' : 'flex gap-[3px]'">
                    <i
                      v-for="mark in record.outcomes"
                      :key="mark"
                      :class="[
                        variant === 'pc'
                          ? 'flex size-[20px] items-center justify-center rounded-full not-italic text-[14px] text-[#fff]'
                          : 'flex size-[18px] items-center justify-center rounded-full not-italic text-[11px] text-[#fff]',
                        ['even', 'small', 'lose', 'player'].includes(mark)
                          ? 'bg-[#E63533]'
                          : 'bg-[#22A89A]'
                      ]"
                      >{{ t(`hashGame.${mark}Mark`) }}</i
                    >
                  </span>
                </span>
                <span class="min-w-0 truncate px-[2px]">
                  {{ record.blockHash ? '…' + record.blockHash.slice(-8) : '—' }}
                </span>
                <a
                  :href="record.explorerUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  :class="
                    variant === 'pc'
                      ? 'justify-self-end text-[16px] text-theme-primary text-right'
                      : 'justify-self-end text-[12px] text-theme-primary text-right'
                  "
                >
                  {{ t('hashGame.verify') }}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { useI18n } from 'vue-i18n'
import type { HashGameHistoryRecord } from '../index'

withDefaults(
  defineProps<{ visible: boolean; records: HashGameHistoryRecord[]; variant?: 'h5' | 'pc' }>(),
  { variant: 'h5' }
)
const emit = defineEmits<{ 'update:visible': [visible: boolean] }>()
const { t } = useI18n()
</script>
