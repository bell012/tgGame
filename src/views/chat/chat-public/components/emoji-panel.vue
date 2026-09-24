<template>
  <!-- 第三方表情选择面板。 -->
  <section class="h-[284px] shrink-0 bg-bg-1 px-[12px] pb-[16px] pt-[12px]">
    <p class="text-[13px] text-text-1">{{ t('chatPublic.allEmojis') }}</p>
    <!-- emoji-picker-element 自定义元素。 -->
    <emoji-picker ref="pickerRef" class="chat-emoji-picker mt-[8px]" />
    <!-- 删除与发送操作区。 -->
    <div class="mt-[14px] flex justify-end gap-[10px]">
      <button type="button" @click="$emit('delete')">
        <DeleteKeyIcon class="h-[43px] w-[63px]" />
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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{ select: [emoji: string]; delete: []; send: [] }>()
const pickerRef = ref<HTMLElement | null>(null)

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

onMounted(bindPickerEvent)
onBeforeUnmount(unbindPickerEvent)
</script>

<style scoped>
.chat-emoji-picker {
  height: 170px;
  width: 100%;
  --background: var(--color-background-level-1);
  --border-color: rgb(255 255 255 / 0.06);
  --border-radius: 8px;
  --category-font-color: var(--color-text-level-1);
  --emoji-size: 1.375rem;
  --input-border-color: rgb(255 255 255 / 0.1);
  --input-font-color: var(--color-text-level-1);
  --input-placeholder-color: var(--color-text-level-3);
}
</style>
