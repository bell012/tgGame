import { readonly, ref, shallowRef, unref, watch, type Ref } from 'vue'
import { useIntersectionObserver, type MaybeRefOrGetter } from './useIntersectionObserver'

function resolveValue<T>(source: MaybeRefOrGetter<T>): T {
  if (typeof source === 'function') {
    return (source as () => T)()
  }
  return unref(source as T | Ref<T>)
}

export interface LoadPageParams {
  page: number
  pageSize: number
  signal?: AbortSignal
}

export interface UseInfiniteScrollOptions<TItem, TResponse> {
  /**
   * 底部哨兵元素
   */
  sentinel: MaybeRefOrGetter<Element | null | undefined>

  /**
   * 滚动容器
   * - 不传：默认使用浏览器视口
   * - 传入：适合移动端内层滚动容器
   */
  root?: MaybeRefOrGetter<Element | Document | null | undefined>

  /**
   * 是否启用
   */
  enabled?: MaybeRefOrGetter<boolean>

  /**
   * 初始化时是否自动加载第一页
   */
  immediate?: boolean

  /**
   * 初始页码
   */
  initialPage?: number

  /**
   * 分页大小
   */
  pageSize?: number

  /**
   * IntersectionObserver 参数
   */
  threshold?: number | number[]
  rootMargin?: string

  /**
   * 请求函数
   */
  load: (params: LoadPageParams) => Promise<TResponse>

  /**
   * 从响应中提取列表
   */
  getItems: (response: TResponse) => TItem[]

  /**
   * 从响应中提取 total（可选）
   */
  getTotal?: (response: TResponse) => number | undefined

  /**
   * 判断是否还有下一页（推荐后端返回 hasMore）
   * 不传时，默认：items.length >= pageSize 视为还有下一页
   */
  getHasMore?: (
    response: TResponse,
    ctx: {
      page: number
      pageSize: number
      items: TItem[]
      currentList: TItem[]
    }
  ) => boolean

  /**
   * 去重函数
   */
  dedupeBy?: (item: TItem) => string | number

  /**
   * 请求成功回调
   */
  onSuccess?: (
    response: TResponse,
    ctx: {
      page: number
      appended: TItem[]
      list: TItem[]
    }
  ) => void

  /**
   * 请求失败回调
   */
  onError?: (error: unknown) => void
}

export function useInfiniteScroll<TItem, TResponse>(
  options: UseInfiniteScrollOptions<TItem, TResponse>
) {
  const list = shallowRef<TItem[]>([])
  const page = ref(options.initialPage ?? 1)
  const pageSize = ref(options.pageSize ?? 20)

  const loading = ref(false)
  const finished = ref(false)
  const error = shallowRef<unknown | null>(null)
  const total = ref<number | null>(null)

  const abortController = shallowRef<AbortController | null>(null)

  function mergeItems(current: TItem[], incoming: TItem[]) {
    if (!options.dedupeBy) {
      return [...current, ...incoming]
    }

    const keyOf = options.dedupeBy
    const seen = new Set(current.map(keyOf))
    const merged = [...current]

    for (const item of incoming) {
      const key = keyOf(item)
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(item)
    }

    return merged
  }

  function abortCurrentRequest() {
    abortController.value?.abort()
    abortController.value = null
  }

  function resetState() {
    list.value = []
    page.value = options.initialPage ?? 1
    loading.value = false
    finished.value = false
    error.value = null
    total.value = null
  }

  async function loadMore() {
    const enabled = resolveValue(options.enabled ?? true)

    if (!enabled) return
    if (loading.value) return
    if (finished.value) return

    const currentPage = page.value
    const currentPageSize = pageSize.value

    loading.value = true
    error.value = null

    const controller = new AbortController()
    abortController.value = controller

    try {
      const response = await options.load({
        page: currentPage,
        pageSize: currentPageSize,
        signal: controller.signal
      })

      const incomingItems = options.getItems(response) ?? []
      const merged = mergeItems(list.value, incomingItems)
      list.value = merged

      if (options.getTotal) {
        const nextTotal = options.getTotal(response)
        total.value = nextTotal ?? null
      }

      const hasMore = options.getHasMore
        ? options.getHasMore(response, {
            page: currentPage,
            pageSize: currentPageSize,
            items: incomingItems,
            currentList: list.value
          })
        : incomingItems.length >= currentPageSize

      finished.value = !hasMore

      if (hasMore) {
        page.value = currentPage + 1
      }

      options.onSuccess?.(response, {
        page: currentPage,
        appended: incomingItems,
        list: list.value
      })
    } catch (err) {
      const isAbortError = err instanceof DOMException && err.name === 'AbortError'

      if (!isAbortError) {
        error.value = err
        options.onError?.(err)
      }
    } finally {
      loading.value = false
      abortController.value = null
    }
  }

  async function refresh() {
    abortCurrentRequest()
    resetState()
    await loadMore()
  }

  function reset() {
    abortCurrentRequest()
    resetState()
  }

  const observer = useIntersectionObserver({
    target: options.sentinel,
    root: options.root,
    threshold: options.threshold ?? 0,
    rootMargin: options.rootMargin ?? '0px 0px 200px 0px',
    enabled: () => resolveValue(options.enabled ?? true) && !loading.value && !finished.value,
    onChange: ({ isIntersecting }) => {
      if (!isIntersecting) return
      void loadMore()
    }
  })

  watch(
    () => resolveValue(options.enabled ?? true),
    enabled => {
      if (!enabled) return
      if (options.immediate === false) return
      if (list.value.length > 0) return
      if (loading.value) return
      if (finished.value) return

      void loadMore()
    },
    {
      immediate: true
    }
  )

  return {
    list: readonly(list),
    page: readonly(page),
    pageSize: readonly(pageSize),
    loading: readonly(loading),
    finished: readonly(finished),
    error: readonly(error),
    total: readonly(total),

    isSupported: observer.isSupported,
    isIntersecting: observer.isIntersecting,

    loadMore,
    refresh,
    reset,
    abortCurrentRequest,
    reconnectObserver: observer.reconnect,
    disconnectObserver: observer.disconnect
  }
}
