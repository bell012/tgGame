<template>
  <!-- 展开内容浮于后续卡片上方，外层保留收起时的列表占位。 -->
  <div
    class="relative min-h-[362px] min-w-0 self-start"
    :style="item.parlay && expanded ? { height: `${collapsedHeight}px` } : undefined"
  >
    <article
      ref="card"
      class="flex min-w-0 flex-col self-start rounded-[10px] bg-bg-2 px-2.5 pb-5 pt-2.5 text-text-1"
      :class="[
        item.parlay && expanded
          ? 'absolute inset-x-0 top-0 z-20 max-h-[740px] shadow-lg'
          : 'relative',
        confirming && !item.parlay ? 'min-h-[366px]' : 'min-h-[362px]'
      ]"
      :style="transitioning && heldHeight ? { height: `${heldHeight}px` } : undefined"
      :data-history-id="item.id"
    >
      <Transition
        name="history-confirm"
        mode="out-in"
        @before-leave="transitioning = true"
        @after-leave="restoreRecordLayout"
        @after-enter="transitioning = false"
      >
        <div :key="confirming ? 'confirm' : 'record'" class="flex min-h-0 flex-1 flex-col">
          <header
            class="flex shrink-0 items-center justify-between gap-3 text-sm leading-5"
            :class="confirming ? 'h-6' : 'h-5'"
          >
            <h2 class="font-bold">{{ confirming ? t('sportsHistory.cashOut') : item.title }}</h2>
            <button
              v-if="confirming"
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded bg-opacity-10 disabled:opacity-50"
              :aria-label="t('sportsHistory.close')"
              :disabled="submitting || transitioning"
              @click="emit('close')"
            >
              <CloseIcon class="h-2.5 w-2.5" />
            </button>
            <span
              v-else
              class="font-pingfang font-normal"
              :class="item.settled ? 'text-theme-primary' : 'text-secondary-7'"
              >{{ item.statusLabel }}</span
            >
          </header>
          <p v-if="item.transactionLabel" class="mt-1 text-xs text-text-2">
            {{ item.transactionLabel }}
          </p>
          <button
            v-if="item.parlay"
            type="button"
            class="mt-2.5 flex h-11 shrink-0 items-center gap-3 rounded-[10px] bg-bg-3 px-2.5 text-left text-sm font-bold"
            :disabled="submitting || transitioning"
            :aria-expanded="expanded"
            @click="toggleExpanded"
          >
            <span class="min-w-0 flex-1 break-words">{{ item.comboLabel }}</span>
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-opacity-10"
              ><CaretIcon
                class="h-4 w-4 text-icon-2 [&_path]:fill-current"
                :class="expanded ? 'rotate-180' : ''"
            /></span>
          </button>
          <div
            v-if="!item.parlay || expanded"
            class="mt-2.5 min-h-0 space-y-2.5"
            :class="item.parlay ? 'overflow-y-auto overscroll-contain' : ''"
          >
            <HistoryEvent
              v-for="selection in item.selections"
              :key="selection.id"
              :item="selection"
              pc
              :cash-out="confirming"
              :show-time="item.parlay"
            />
          </div>
          <HistoryFields
            class="mb-5 shrink-0 pt-5"
            :class="item.parlay ? '' : 'mt-auto'"
            :item="item"
            pc
            :show-odds="item.parlay"
          />
          <div
            v-if="confirming"
            class="grid shrink-0 grid-cols-2 gap-4"
            :class="item.parlay ? 'mt-auto' : ''"
          >
            <button
              type="button"
              :class="actionClass"
              :disabled="submitting || transitioning"
              @click="emit('close')"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="button"
              :class="actionClass"
              :disabled="submitting || transitioning || !item.cashOutAvailable"
              @click="emit('confirm')"
            >
              {{ submitting ? t('common.loading') : t('common.confirm') }}
            </button>
          </div>
          <button
            v-else
            type="button"
            class="flex h-9 shrink-0 items-center justify-center rounded-[30px] text-sm font-bold"
            :class="[
              item.cashOutAvailable ? 'bg-theme-primary text-text-4' : 'bg-bg-3 text-text-3',
              item.parlay ? 'mt-auto' : ''
            ]"
            :disabled="!item.cashOutAvailable || submitting || transitioning"
            @click="openConfirm"
          >
            {{ t('sportsHistory.cashOut') }}
          </button>
        </div>
      </Transition>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import CaretIcon from '@/static/svg/arrow_down.svg?component'
import HistoryEvent from './HistoryEvent.vue'
import HistoryFields from './HistoryFields.vue'
import type { HistoryWagerView } from '../shared'

const props = defineProps<{ item: HistoryWagerView; confirming: boolean; submitting: boolean }>()
const emit = defineEmits<{ open: []; close: []; confirm: [] }>()
const { t } = useI18n()
const expanded = ref(false)
const card = ref<HTMLElement | null>(null)
const collapsedHeight = ref(362)
const heldHeight = ref(0)
const transitioning = ref(false)
let recordLayout = { expanded: false, collapsedHeight: 362, height: 362 }
const actionClass =
  'flex h-9 items-center justify-center rounded-[30px] bg-theme-primary text-sm font-bold text-text-4 disabled:opacity-50'
const toggleExpanded = () => {
  if (props.submitting || transitioning.value) return
  if (!expanded.value) collapsedHeight.value = card.value?.getBoundingClientRect().height ?? 362
  expanded.value = !expanded.value
}
const openConfirm = () => {
  emit('open')
}
// 确认界面退出后恢复进入前的布局，不把临时展开状态带回记录卡片。
const restoreRecordLayout = () => {
  if (props.confirming) return
  expanded.value = recordLayout.expanded
  collapsedHeight.value = recordLayout.collapsedHeight
  heldHeight.value = recordLayout.height
}
watch(
  () => props.confirming,
  confirming => {
    // 仅在界面过渡时锁住当前高度，串关在确认界面仍可独立展开和收起。
    heldHeight.value = card.value?.getBoundingClientRect().height ?? 362
    if (confirming) {
      recordLayout = {
        expanded: expanded.value,
        collapsedHeight: collapsedHeight.value,
        height: heldHeight.value
      }
    }
    transitioning.value = true
  }
)
</script>

<style scoped lang="scss">
.history-confirm-enter-active,
.history-confirm-leave-active {
  transition: opacity 200ms ease;
}
.history-confirm-enter-from,
.history-confirm-leave-to {
  opacity: 0;
}
</style>
