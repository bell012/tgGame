import { computed, reactive, ref, watch, type Ref } from 'vue'
import Api from '@/api'
import type { RedEnvelopeItem } from '@/api/interface/red-envelope'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

export type RedPacketDisplayMode = 'pc' | 'h5'

export type RedPacketPanelView = 'list' | 'history' | 'mine'

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
  // 首屏滚到底之前不观察顶部哨兵，避免一打开就连续加载更早的页
  const ready = ref(false)
  const { currentCurrencyCode } = useDisplayCurrency()

  const scroll = useInfiniteScroll({
    sentinel: () => (ready.value ? options.sentinel.value : null),
    root: options.root,
    pageSize: 10,
    // 靠近顶部时预加载更早的红包
    rootMargin: '200px 0px 0px 0px',
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

  // 接口按新到旧返回，显示层反转成最旧在上、最新在底部
  const displayList = computed(() => [...list.value].reverse())

  const updateItem = (redEnvelopeId: number, patch: Partial<RedEnvelopeItem>) => {
    patches.set(redEnvelopeId, { ...patches.get(redEnvelopeId), ...patch })
  }

  const markReady = () => {
    ready.value = true
  }

  watch(currentCurrencyCode, (value, oldValue) => {
    if (!value || value === oldValue) return
    patches.clear()
    ready.value = false
    void scroll.refresh()
  })

  return {
    list,
    displayList,
    loading: scroll.loading,
    finished: scroll.finished,
    error: scroll.error,
    retry: scroll.retry,
    updateItem,
    markReady
  }
}
