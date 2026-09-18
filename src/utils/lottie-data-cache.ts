export type LottieData = Record<string, unknown>

const dataCache = new Map<string, LottieData>()
const pendingRequests = new Map<string, Promise<LottieData | null>>()

export const getCachedLottieData = (url: string) => (url ? (dataCache.get(url) ?? null) : null)

// lottie-web 会改写传入的 animationData，多次 loadAnimation 前必须深拷贝。
export const cloneLottieData = (data: LottieData) =>
  typeof structuredClone === 'function'
    ? structuredClone(data)
    : (JSON.parse(JSON.stringify(data)) as LottieData)

export const loadLottieData = (url: string): Promise<LottieData | null> => {
  if (!url) return Promise.resolve(null)

  const cached = dataCache.get(url)
  if (cached) return Promise.resolve(cached)

  const pending = pendingRequests.get(url)
  if (pending) return pending

  const request = fetch(url, { credentials: 'omit' })
    .then(response => (response.ok ? (response.json() as Promise<unknown>) : null))
    .then(data => {
      if (!data || typeof data !== 'object' || Array.isArray(data)) return null
      const animationData = data as LottieData
      dataCache.set(url, animationData)
      return animationData
    })
    .catch(() => null)
    .finally(() => {
      pendingRequests.delete(url)
    })

  pendingRequests.set(url, request)
  return request
}

const runWhenIdle = (task: () => void) => {
  if (typeof window === 'undefined') {
    task()
    return
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => task(), { timeout: 2000 })
    return
  }

  window.setTimeout(task, 200)
}

export const prefetchLottieData = (url: string) =>
  new Promise<LottieData | null>(resolve => {
    if (!url) {
      resolve(null)
      return
    }

    const cached = dataCache.get(url)
    if (cached) {
      resolve(cached)
      return
    }

    runWhenIdle(() => {
      void loadLottieData(url).then(resolve)
    })
  })
