import { computed, readonly, ref, shallowRef, watch } from 'vue'
import Api from '@/api'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { getCachedLottieData, prefetchLottieData, type LottieData } from '@/utils/lottie-data-cache'

type SiteConfigWithLoadingImage = {
  baseSiteConfig?: {
    loading?: {
      image?: unknown
    }
    'loading.image'?: unknown
  }
}

export const resolveOnlineCustomerLoadingLottieUrl = (config: unknown): string => {
  const baseSiteConfig = (config as SiteConfigWithLoadingImage | null | undefined)?.baseSiteConfig
  if (!baseSiteConfig) return ''

  const nestedImage = baseSiteConfig.loading?.image
  const dottedImage = baseSiteConfig['loading.image']
  const raw = String(nestedImage ?? dottedImage ?? '').trim()
  if (!raw) return ''
  const toDevProxyUrl = (absoluteUrl: string) => {
    const encodedAbsolute = encodeURI(absoluteUrl)
    if (!import.meta.env.DEV) return encodedAbsolute
    try {
      const parsed = new URL(encodedAbsolute)
      const imageBase = new URL(
        String(import.meta.env.VITE_GAME_IMAGE_BASE_URL || 'https://pic.txtvv9.top/')
      )
      if (parsed.origin === imageBase.origin) {
        return `/pic-cdn${parsed.pathname}${parsed.search}`
      }
    } catch {
      /* keep the absolute CDN URL */
    }
    return encodedAbsolute
  }

  if (/^https?:\/\//i.test(raw)) return toDevProxyUrl(raw)

  const baseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
  const imagePath = raw.replace(/^\/+/, '')
  const absoluteUrl = baseUrl ? `${baseUrl}/${imagePath}` : imagePath
  return toDevProxyUrl(absoluteUrl)
}

const visible = ref(false)
const loading = ref(false)
const url = ref('')
const errorKey = ref('')
let requestVersion = 0

const load = async () => {
  if (loading.value) return
  const version = ++requestVersion
  loading.value = true
  errorKey.value = ''

  try {
    const response = await Api.onlineCustomer.queryOnLineByType()
    if (version !== requestVersion) return
    if (!response?.success) {
      if (visible.value && !url.value) errorKey.value = 'onlineCustomer.requestFailed'
      return
    }
    if (!response.result) {
      if (visible.value && !url.value) errorKey.value = 'onlineCustomer.unavailable'
      return
    }
    if (response.result.subType !== 2) {
      if (visible.value && !url.value) errorKey.value = 'onlineCustomer.unsupported'
      return
    }
    try {
      const address = new URL(response.result.url)
      if (!['http:', 'https:'].includes(address.protocol)) throw new Error('Invalid protocol')
      url.value = address.href
    } catch {
      if (visible.value && !url.value) errorKey.value = 'onlineCustomer.invalidUrl'
    }
  } catch {
    if (version === requestVersion && visible.value && !url.value) {
      errorKey.value = 'onlineCustomer.requestFailed'
    }
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

const lottieData = shallowRef<LottieData | null>(null)
let lottieDataUrl = ''

// 空闲时把加载动画的 JSON 拉到内存，之后每次打开客服都能直接用缓存渲染。
const syncLoadingLottieData = (url: string) => {
  lottieDataUrl = url
  if (!url) {
    lottieData.value = null
    return
  }

  const cached = getCachedLottieData(url)
  if (cached) {
    lottieData.value = cached
    return
  }

  lottieData.value = null
  void prefetchLottieData(url).then(data => {
    if (data && lottieDataUrl === url) lottieData.value = data
  })
}

let prefetchStarted = false

const prefetch = () => {
  if (prefetchStarted || url.value) return
  prefetchStarted = true
  void load()
}

const open = () => {
  if (visible.value) return
  visible.value = true
  errorKey.value = ''
  void load()
}

const close = () => {
  visible.value = false
  requestVersion += 1
  loading.value = false
}

// Keep the last iframe URL so the next open can paint immediately.
const afterLeave = () => {
  if (visible.value) return
  errorKey.value = ''
}

export const useOnlineCustomerService = () => {
  const siteConfigStore = useSiteConfigStore()
  const loadingLottieUrl = computed(() =>
    resolveOnlineCustomerLoadingLottieUrl(siteConfigStore.config)
  )
  prefetch()
  watch(loadingLottieUrl, syncLoadingLottieData, { immediate: true })

  return {
    visible: readonly(visible),
    loading: readonly(loading),
    url: readonly(url),
    errorKey: readonly(errorKey),
    loadingLottieUrl,
    loadingLottieData: computed(() => lottieData.value),
    open,
    close,
    retry: load,
    afterLeave
  }
}
