import { computed, ref } from 'vue'
import type { ChatComposerMode, ChatReplyTarget } from '../types'

/** 管理输入草稿、表情/媒体面板和引用回复等编辑器状态。 */
export function useChatComposer() {
  const draft = ref('')
  const mode = ref<ChatComposerMode>('idle')
  const replyTarget = ref<ChatReplyTarget | null>(null)

  /** 判断当前输入框是否存在可发送的非空草稿。 */
  const hasDraft = computed(() => draft.value.trim().length > 0)

  /** 更新草稿，并依照当前面板与回复状态同步编辑器展示模式。 */
  const setDraft = (value: string) => {
    draft.value = value
    if (replyTarget.value) {
      mode.value = 'reply'
      return
    }
    if (mode.value !== 'emoji' && mode.value !== 'media') {
      mode.value = value.length > 0 ? 'typing' : 'idle'
    }
  }

  /** 切换表情面板，关闭时恢复输入或空闲状态。 */
  const toggleEmoji = () => {
    mode.value = mode.value === 'emoji' ? (hasDraft.value ? 'typing' : 'idle') : 'emoji'
  }

  /** 切换图片功能面板，关闭时恢复输入或空闲状态。 */
  const toggleMedia = () => {
    mode.value = mode.value === 'media' ? (hasDraft.value ? 'typing' : 'idle') : 'media'
  }

  /** 记录被回复的消息，并将编辑器切换至引用回复状态。 */
  const startReply = (target: ChatReplyTarget) => {
    replyTarget.value = target
    mode.value = 'reply'
  }

  /** 取消引用回复，保留用户已输入的草稿。 */
  const cancelReply = () => {
    replyTarget.value = null
    mode.value = hasDraft.value ? 'typing' : 'idle'
  }

  /** 发送完成后清理草稿、引用目标和临时面板状态。 */
  const resetAfterSend = () => {
    draft.value = ''
    replyTarget.value = null
    mode.value = 'idle'
  }

  return {
    draft,
    mode,
    replyTarget,
    hasDraft,
    setDraft,
    toggleEmoji,
    toggleMedia,
    startReply,
    cancelReply,
    resetAfterSend
  }
}
