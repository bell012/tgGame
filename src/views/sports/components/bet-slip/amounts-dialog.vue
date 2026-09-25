<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[10021] flex items-center justify-center bg-mask-60-1 p-6 font-inter text-text-1"
      @click.self="emit('close')"
      @keydown.esc.stop.prevent="emit('close')"
      @keydown.tab="trapFocus"
    >
      <section
        ref="dialog"
        class="max-h-[calc(100dvh-48px)] w-[492px] max-w-full overflow-y-auto rounded-3xl bg-bg-1 p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <header class="flex h-6 items-center justify-between gap-3">
          <h2 :id="titleId" class="text-xl font-bold leading-6">Edit Quick Bet Amounts</h2>
          <button
            type="button"
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-opacity-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
            aria-label="Close quick amount editor"
            @click="emit('close')"
          >
            <CloseIcon class="h-2.5 w-2.5" aria-hidden="true" />
          </button>
        </header>

        <div class="mt-6 flex items-center justify-between gap-3 text-sm leading-5">
          <span>Custom Order</span>
          <span class="text-theme-primary">Press and hold to drag</span>
        </div>
        <ol class="mt-4 flex flex-col gap-4">
          <li
            v-for="(row, index) in drafts"
            :key="row.id"
            class="flex h-11 items-center gap-1 rounded-lg border border-solid bg-input-3 px-2.5"
            :class="
              error
                ? 'border-secondary-2'
                : dragOverId === row.id
                  ? 'border-theme-primary'
                  : 'border-opacity-10 focus-within:border-theme-primary'
            "
            @dragover.prevent="dragOverId = row.id"
            @drop.prevent="dropAmount(index)"
          >
            <span class="shrink-0 text-sm font-bold" aria-hidden="true">
              {{ props.currencySymbol }}
            </span>
            <input
              v-model="row.value"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              maxlength="10"
              class="min-w-0 flex-1 bg-transparent text-sm font-bold leading-5 outline-none placeholder:font-normal placeholder:text-text-3"
              placeholder="Enter a quick bet amount"
              :aria-label="`Quick bet amount ${index + 1}`"
              :aria-invalid="Boolean(error)"
              :aria-describedby="error ? errorId : undefined"
              @input="error = ''"
              @keydown.enter.prevent="save"
            />
            <button
              type="button"
              draggable="true"
              class="flex h-8 w-5 shrink-0 cursor-grab flex-col justify-center gap-1.5 text-text-3 active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
              :aria-label="`Reorder quick amount ${index + 1}. Use the up and down arrow keys.`"
              @dragstart="startDrag($event, row.id)"
              @dragend="clearDrag"
              @keydown.up.prevent="moveAmount(index, index - 1)"
              @keydown.down.prevent="moveAmount(index, index + 1)"
            >
              <span v-for="line in 3" :key="line" class="h-px w-5 bg-current" />
            </button>
          </li>
        </ol>
        <p v-if="error" :id="errorId" class="mt-3 text-xs text-secondary-2" role="alert">
          {{ error }}
        </p>
        <button
          type="button"
          class="mt-6 flex h-[49px] w-full items-center justify-center rounded-lg bg-theme-primary text-sm font-bold text-text-4 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-1"
          @click="save"
        >
          Save
        </button>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import CloseIcon from '@/static/svg/close.svg?component'
import { parseSportsStake } from './shared'

const props = defineProps<{ amounts: readonly number[]; currencySymbol: string }>()
const emit = defineEmits<{ close: []; save: [amounts: number[]] }>()
const titleId = useId()
const errorId = useId()
const dialog = ref<HTMLElement | null>(null)
// 保存前只修改草稿，关闭时丢弃。
const drafts = ref(
  Array.from({ length: 4 }, (_, id) => ({ id, value: String(props.amounts[id] ?? '') }))
)
const error = ref('')
const draggedId = ref<number | null>(null)
const dragOverId = ref<number | null>(null)
let returnFocus: HTMLElement | null = null

usePageScrollLock(() => true)
onMounted(async () => {
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  await nextTick()
  dialog.value?.querySelector('input')?.focus()
})
onBeforeUnmount(() => {
  if (returnFocus?.isConnected) returnFocus.focus()
})

function clearDrag() {
  draggedId.value = null
  dragOverId.value = null
}

function startDrag(event: DragEvent, id: number) {
  draggedId.value = id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(id))
  }
}

function moveAmount(from: number, to: number) {
  if (from === to || to < 0 || to >= drafts.value.length || from < 0) return
  const [moved] = drafts.value.splice(from, 1)
  if (moved) drafts.value.splice(to, 0, moved)
}

function dropAmount(to: number) {
  const from = drafts.value.findIndex(row => row.id === draggedId.value)
  if (from !== -1) moveAmount(from, to)
  clearDrag()
}

function save() {
  const amounts = drafts.value.map(row => parseSportsStake(row.value))
  if (amounts.some(amount => amount === null || amount <= 0)) {
    error.value = 'Enter four positive amounts with up to two decimal places.'
    return
  }
  const values = amounts.filter((amount): amount is number => amount !== null)
  if (new Set(values).size !== values.length) {
    error.value = 'Enter four different quick amounts.'
    return
  }
  emit('save', values)
}

function trapFocus(event: KeyboardEvent) {
  const controls = dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), input')
  const first = controls?.[0]
  const last = controls?.[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
</script>
