import { shallowRef } from 'vue'

/** 供各游戏聊天室共用的最小消息约束。 */
export type GameChatItem = { id: string; kind: string; time: number; source?: string }

/** 管理单次页面会话的聊天列表，不做持久化。 */
export function useGameChatFeed<T extends GameChatItem>(limit = 200) {
  const messages = shallowRef<T[]>([])

  /** 按消息 ID 去重后追加，并限制本次会话的列表长度。 */
  function append(message: T) {
    if (messages.value.some(item => item.id === message.id)) return false
    const next = [...messages.value, message]
    messages.value =
      next[0]?.kind === 'NOTICE'
        ? [next[0], ...(limit > 1 ? next.slice(1).slice(-(limit - 1)) : [])]
        : next.slice(-limit)
    return true
  }

  /** 历史消息按时间放在实时消息之前，房间公告始终排在最前。 */
  function prependHistory(history: T[]) {
    const seen = new Set<string>()
    const notice = messages.value.filter(item => item.kind === 'NOTICE')
    const existing = messages.value.filter(item => item.kind !== 'NOTICE')
    const ordered = [...notice, ...history.sort((a, b) => a.time - b.time), ...existing]
    const unique = ordered.filter(item => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    messages.value = notice.length
      ? [
          ...unique.slice(0, notice.length),
          ...unique.slice(notice.length).slice(-(limit - notice.length))
        ]
      : unique.slice(-limit)
  }

  /** 新开房间或离开页面时清空本次会话消息。 */
  function clear() {
    messages.value = []
  }

  return { messages, append, prependHistory, clear }
}
