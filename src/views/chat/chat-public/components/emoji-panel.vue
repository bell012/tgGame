<template>
  <!-- 第三方表情选择面板。 -->
  <section
    ref="panelRef"
    class="chat-emoji-panel flex h-[384px] shrink-0 flex-col px-[12px] pb-[16px] pt-[12px]"
    :class="props.displayMode === 'pc' ? 'bg-bg-5' : 'bg-bg-1'"
  >
    <p class="shrink-0 text-[13px] leading-[16px] text-text-2">{{ t('chatPublic.allEmojis') }}</p>
    <!-- emoji-picker-element 自定义元素。 -->
    <emoji-picker
      ref="pickerRef"
      class="chat-emoji-picker mt-[8px]"
      :class="props.displayMode === 'pc' ? 'chat-emoji-picker--pc' : ''"
    />
    <!-- 删除与发送操作区。 -->
    <div
      v-if="props.displayMode !== 'pc' && props.hasEmoji"
      class="mt-[14px] flex shrink-0 justify-end gap-[10px]"
    >
      <button
        type="button"
        @click="$emit('delete')"
        class="flex h-[42.67px] w-[63px] items-center justify-center rounded-[6px] bg-bg-2 px-[17px] py-[14.33px]"
      >
        <DeleteKeyIcon class="h-[13px] w-[19.34px] text-icon-1" />
      </button>
      <button
        type="button"
        class="h-[43px] w-[63px] rounded-[6px] bg-theme-primary text-[14px] font-bold text-text-4"
        @click="$emit('send')"
      >
        {{ t('chatPublic.send') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import DeleteKeyIcon from '@/static/svg/chat/public/delete-key.svg?component'
import 'emoji-picker-element'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

onMounted(async () => {
  await nextTick()

  const picker = pickerRef.value
  const shadowRoot = picker?.shadowRoot

  if (!shadowRoot) return

  const style = document.createElement('style')

  style.textContent = `
    /* 隐藏搜索框 */
    .search-row {
      display: none !important;
    }

       /* 隐藏搜索框 */
    .pad-top {
      display: none !important;
    }
    .indicator-wrapper {
      display: none !important;
    }

    /* 隐藏顶部分类栏 */
    .favorites {
      display: none !important;
    }

 /* 隐藏顶部分类栏 */
    .nav {
      display: none !important;
    }
      /* 隐藏 Emoji 区域右侧滚动条，但仍然可以滚动 */
  .tabpanel {
    scrollbar-width: none;      /* Firefox */
    -ms-overflow-style: none;   /* 旧 Edge / IE */
  }

  .tabpanel::-webkit-scrollbar {
    display: none;              /* Chrome / Safari */
  }
    
  `

  shadowRoot.appendChild(style)
})

const { t } = useI18n()

const props = withDefaults(defineProps<{ hasEmoji: boolean; displayMode?: 'h5' | 'pc' }>(), {
  displayMode: 'h5'
})

const emit = defineEmits<{ select: [emoji: string]; delete: []; send: []; close: [] }>()
const pickerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

/** 将第三方表情组件的 emoji-click 事件转换为页面组件事件。 */
const handleEmojiClick = (event: Event) => {
  const detail = (event as CustomEvent<{ unicode?: string }>).detail
  if (detail?.unicode) emit('select', detail.unicode)
}

/** 挂载时监听第三方 Web Component 的原生自定义事件。 */
const bindPickerEvent = () => pickerRef.value?.addEventListener('emoji-click', handleEmojiClick)

/** 卸载时移除原生事件，避免重新打开面板后重复写入表情。 */
const unbindPickerEvent = () =>
  pickerRef.value?.removeEventListener('emoji-click', handleEmojiClick)

/** 表情面板展开时，点击面板外任意区域立即收起；Shadow DOM 内部点击会保留面板。 */
const handleDocumentPointerDown = (event: PointerEvent) => {
  if (panelRef.value && event.composedPath().includes(panelRef.value)) return
  const isComposerInputClick = event
    .composedPath()
    .some(
      target => target instanceof HTMLElement && target.hasAttribute('data-chat-composer-input')
    )
  if (isComposerInputClick) return
  emit('close')
}

onMounted(() => {
  bindPickerEvent()
  document.addEventListener('pointerdown', handleDocumentPointerDown, true)
})
onBeforeUnmount(() => {
  unbindPickerEvent()
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
})
</script>

<style scoped>
.chat-emoji-picker {
  display: block;
  min-height: 0;
  flex: 1 1 auto;
  width: 100%;
  touch-action: pan-y;
  overscroll-behavior: contain;
  --background: var(--color-background-level-1);
  --border-size: 0px;
  --category-font-color: var(--color-text-level-1);
  --num-columns: 7;
  --emoji-size: 1.875rem;
  --input-border-color: rgb(255 255 255 / 0.1);
  --input-font-color: var(--color-text-level-1);
  --input-placeholder-color: var(--color-text-level-3);
}

.chat-emoji-picker--pc {
  --background: var(--color-background-level-5);
}
</style>
