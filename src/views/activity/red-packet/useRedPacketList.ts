import { computed, reactive, type Ref } from 'vue'
import Api from '@/api'
import type { RedEnvelopeItem } from '@/api/interface/red-envelope'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

export type RedPacketDisplayMode = 'pc' | 'h5'

const CHANNEL_BY_MODE: Record<RedPacketDisplayMode, string> = {
  pc: '3',
  h5: '4'
}

export function useRedPacketList(options: {
  displayMode: () => RedPacketDisplayMode
  sentinel: Ref<Element | null | undefined>
  root: Ref<Element | null | undefined>
}) {
  const patches = reactive(new Map<number, Partial<RedEnvelopeItem>>())

  const scroll = useInfiniteScroll({
    sentinel: options.sentinel,
    root: options.root,
    pageSize: 10,
    load: ({ page, pageSize }) => Api.redEnvelope.getMemberList(page, pageSize),
    getItems: response => {
      const channel = CHANNEL_BY_MODE[options.displayMode()]
      return (response.records ?? []).filter(item => item.channelId?.includes(channel))
    },
    getTotal: response => response.total,
    getHasMore: (response, { page, pageSize }) => page * pageSize < (response.total ?? 0),
    dedupeBy: item => item.redEnvelopeId
  })

  const list = computed(() =>
    (scroll.list.value as RedEnvelopeItem[]).map(item => {
      const patch = patches.get(item.redEnvelopeId)
      return patch ? { ...item, ...patch } : item
    })
  )

  const updateItem = (redEnvelopeId: number, patch: Partial<RedEnvelopeItem>) => {
    patches.set(redEnvelopeId, { ...patches.get(redEnvelopeId), ...patch })
  }

  return {
    list,
    loading: scroll.loading,
    finished: scroll.finished,
    error: scroll.error,
    retry: scroll.retry,
    updateItem
  }
}
