import { computed, readonly, ref, shallowRef, watch } from 'vue'
import Api from '@/api'
import i18n from '@/i18n'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { resolveGameImageUrl } from '@/utils/image'
import { getCachedLottieData, prefetchLottieData, type LottieData } from '@/utils/lottie-data-cache'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'

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
    return encodedAbsolute
  }

  if (/^https?:\/\//i.test(raw)) return toDevProxyUrl(raw)

  const absoluteUrl = resolveGameImageUrl(raw)
  return toDevProxyUrl(absoluteUrl)
}

const visible = ref(false)
const loading = ref(false)
const url = ref('')
const errorKey = ref('')
const iframeReloadVersion = ref(0)
let requestVersion = 0
let pendingModeRequest: Promise<OnlineCustomerMode> | null = null

type OnlineCustomerMode =
  | { type: 'iframe'; url: string }
  | { type: 'native' }
  | { type: 'request-error'; message: string }
  | { type: 'cancelled' }

/** 将后台第三方客服地址校验并规范为可嵌入 iframe 的 HTTP 地址。 */
const resolveIframeUrl = (value: unknown) => {
  try {
    const address = new URL(String(value ?? '').trim())
    return ['http:', 'https:'].includes(address.protocol) ? address.href : ''
  } catch {
    return ''
  }
}

/** 请求客服模式配置；同一时刻复用请求，避免预请求与点击操作重复发起。 */
const requestOnlineCustomerMode = () => {
  if (pendingModeRequest) return pendingModeRequest

  const version = ++requestVersion
  loading.value = true

  const request = Api.onlineCustomer
    .queryOnLineByType()
    .then(response => {
      if (version !== requestVersion) return { type: 'cancelled' } as const

      if (!response?.success) {
        return {
          type: 'request-error',
          message: String(response?.message ?? '').trim() || i18n.global.t('common.requestError')
        } as const
      }

      const iframeUrl =
        Number(response.result?.subType) === 2 ? resolveIframeUrl(response.result?.url) : ''
      return iframeUrl
        ? ({ type: 'iframe', url: iframeUrl } as const)
        : ({ type: 'native' } as const)
    })
    .catch(
      () => ({ type: 'request-error', message: i18n.global.t('common.requestError') }) as const
    )
    .finally(() => {
      if (version === requestVersion) loading.value = false
      if (pendingModeRequest === request) pendingModeRequest = null
    })

  pendingModeRequest = request
  return request
}

/** 根据服务端客服模式打开第三方 iframe 或原生客服页面。 */
const openByOnlineCustomerMode = async () => {
  const mode = await requestOnlineCustomerMode()
  if (mode.type === 'cancelled') return

  if (mode.type === 'request-error') {
    globalShowToast({ message: mode.message, type: 'fail' })
    return
  }

  if (mode.type === 'native') {
    url.value = ''
    visible.value = false
    void navigateTo('/chat-public')
    return
  }

  errorKey.value = ''
  url.value = mode.url
  iframeReloadVersion.value += 1
  visible.value = true
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
  if (prefetchStarted) return
  prefetchStarted = true
  void requestOnlineCustomerMode()
}

/** 保持现有客服入口调用方式不变，在用户点击后按后台模式打开客服。 */
const open = () => {
  if (visible.value) return
  void openByOnlineCustomerMode()
}

const close = () => {
  visible.value = false
  requestVersion += 1
  pendingModeRequest = null
  loading.value = false
}

/** iframe 错误页点击重试后重新请求模式配置，并重载有效的第三方地址。 */
const retry = () => {
  void openByOnlineCustomerMode()
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
    iframeReloadVersion: readonly(iframeReloadVersion),
    loadingLottieUrl,
    loadingLottieData: computed(() => lottieData.value),
    open,
    close,
    retry,
    afterLeave
  }
}
