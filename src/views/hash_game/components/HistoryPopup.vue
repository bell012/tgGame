<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="visible"
        class="fixed inset-0 z-[1000] flex items-end bg-mask-60-1"
        @click.self="emit('update:visible', false)"
        @keydown.esc.stop.prevent="emit('update:visible', false)"
      >
        <section
          class="bottom-sheet-panel flex h-[70vh] w-full flex-col overflow-hidden rounded-[12px] px-[12px] py-[12px] bg-bg-1 text-text-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hash-game-history-title"
        >
          <h2
            id="hash-game-history-title"
            class="flex shrink-0 items-center justify-center text-[19px] font-[600] text-text-1 mb-[12px]"
          >
            {{ t('hashGame.history') }}
          </h2>

          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div
              class="grid grid-cols-[0.8fr_1.2fr_1.2fr_0.8fr] items-center rounded-t-[8px] bg-bg-3 px-[12px] py-[6px] text-center text-[11px] text-text-2"
            >
              <span class="text-left">{{ t('hashGame.betBlock') }}</span>
              <span>{{ t('hashGame.result') }}</span>
              <span>{{ t('hashGame.blockHash') }}</span>
              <span class="text-right">{{ t('hashGame.actions') }}</span>
            </div>
            <div class="bg-bg-2 rounded-b-[8px]">
              <div
                v-for="(record, index) in records"
                :key="record.id"
                class="grid grid-cols-[0.8fr_1.2fr_1.2fr_0.8fr] items-center px-[12px] py-[7px] text-center text-[12px] text-text-2"
                :class="index % 2 === 0 ? 'bg-bg-2' : 'bg-bg-3'"
              >
                <span class="text-left">{{ record.block }}</span>
                <span class="flex items-center justify-center gap-[7px]">
                  <b
                    :class="
                      record.outcome === 'evenSmall' ? 'text-secondary-2' : 'text-secondary-11'
                    "
                  >
                    {{ record.digit }}
                  </b>
                  <span class="h-[15px] w-px shrink-0 bg-opacity-6" aria-hidden="true" />
                  <span class="flex gap-[3px]">
                    <i
                      v-for="mark in resultMarks(record.outcome)"
                      :key="mark"
                      class="flex size-[18px] items-center justify-center rounded-full not-italic text-[11px] text-text-1"
                      :class="record.outcome === 'evenSmall' ? 'bg-secondary-2' : 'bg-[#22A89A]'"
                      >{{ t(`hashGame.${mark}Mark`) }}</i
                    >
                  </span>
                </span>
                <span class="min-w-0 truncate px-[2px]">
                  {{ record.blockHash.slice(0, -1)
                  }}<b
                    :class="
                      Number(record.blockHash.slice(-1)) % 2 === 0
                        ? 'text-secondary-2'
                        : 'text-secondary-11'
                    "
                    >{{ record.blockHash.slice(-1) }}</b
                  >
                </span>
                <button
                  type="button"
                  class="justify-self-end text-[12px] text-theme-primary text-right"
                >
                  {{ t('hashGame.verify') }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { HashGameHistoryRecord } from '../index'

defineProps<{ visible: boolean; records: HashGameHistoryRecord[] }>()
const emit = defineEmits<{ 'update:visible': [visible: boolean] }>()
const { t } = useI18n()

const resultMarks = (outcome: HashGameHistoryRecord['outcome']) =>
  outcome === 'evenSmall' ? ['even', 'small'] : ['odd', 'big']
</script>
