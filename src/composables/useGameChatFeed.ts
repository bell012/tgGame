import { shallowRef } from 'vue'

/** 供各游戏聊天室共用的最小消息约束。 */
export type GameChatItem = { id: string; kind: string; time: number }

/** 管理单次页面会话的聊天列表，不做持久化。 */
export function useGameChatFeed<T extends GameChatItem>(limit = 200) {
  const messages = shallowRef<T[]>([])

  /** 按消息 ID 去重后追加，并限制本次会话的列表长度。 */
  function append(message: T) {
    if (messages.value.some(item => item.id === message.id)) return false
    messages.value = [...messages.value, message].slice(-limit)
    return true
  }

  /** 历史消息按时间插入现有消息之前，并按 ID 去重。 */
  function prependHistory(history: T[]) {
    const seen = new Set<string>()
    messages.value = [...history.sort((a, b) => a.time - b.time), ...messages.value]
      .filter(item => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
      .slice(-limit)
  }

  /** 新开房间或离开页面时清空本次会话消息。 */
  function clear() {
    messages.value = []
  }

  return { messages, append, prependHistory, clear }
}
