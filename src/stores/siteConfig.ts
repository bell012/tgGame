import { defineStore } from 'pinia'
import { ref } from 'vue'
import Api from '@/api'
import type {
  DlicghRequest,
  DlicghResult,
  DlicghSiteItem,
  DlicghSiteLanguage
} from '@/api/interface/home.interface'
import { resolveGameImageUrl } from '@/utils/image'
import { getLanguageCode } from '@/utils/locale'

export const SITE_CONFIG_STORAGE_KEY = 'config'

export type SiteConfig = DlicghResult
export interface PushMessageMqttConfig {
  host: string
  username: string
  password: string
}

type PendingSiteConfigRequest = {
  promise: Promise<SiteConfig | null>
}

const normalizeSiteChannelId = (channelId?: string | number) => {
  return String(channelId ?? '').trim()
}

const normalizeSiteLanguageCode = (languageCode?: string) => {
  const normalizedCode = String(languageCode || getLanguageCode())
    .trim()
    .toLowerCase()

  if (normalizedCode === 'en') {
    return 'eng'
  }

  if (normalizedCode.startsWith('zh')) {
    return 'zh'
  }

  return normalizedCode || 'eng'
}

const mergeSiteList = (
  currentSiteList?: DlicghSiteItem[],
  nextSiteList?: DlicghSiteItem[]
): DlicghSiteItem[] | undefined => {
  if (!Array.isArray(nextSiteList)) {
    return currentSiteList
  }

  const mergedSiteMap = new Map<string, DlicghSiteItem>()

  currentSiteList?.forEach(site => {
    const siteLayoutId = normalizeSiteChannelId(site.siteLayoutId)
    if (siteLayoutId) {
      mergedSiteMap.set(siteLayoutId, site)
    }
  })

  nextSiteList.forEach(site => {
    const siteLayoutId = normalizeSiteChannelId(site.siteLayoutId)
    if (siteLayoutId) {
      mergedSiteMap.set(siteLayoutId, site)
    }
  })

  return Array.from(mergedSiteMap.values())
}

const parseStoredSiteConfig = (): SiteConfig | null => {
  const storedValue = localStorage.getItem(SITE_CONFIG_STORAGE_KEY)

  if (!storedValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown

    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return null
    }

    return parsedValue as SiteConfig
  } catch (error) {
    console.error(error)
    return null
  }
}

export const useSiteConfigStore = defineStore('siteConfig', () => {
  const config = ref<SiteConfig | null>(parseStoredSiteConfig())
  const isLoading = ref(false)
  const isInitialized = ref(false)

  let pendingRequest: PendingSiteConfigRequest | null = null

  const setConfigState = (nextConfig: SiteConfig | null, persist = true) => {
    config.value = nextConfig

    if (persist) {
      if (nextConfig) {
        localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(nextConfig))
      } else {
        localStorage.removeItem(SITE_CONFIG_STORAGE_KEY)
      }
    }

    return config.value
  }

  const syncStoredConfig = () => {
    return setConfigState(parseStoredSiteConfig(), false)
  }

  const mergeSiteConfig = (nextConfig: SiteConfig) => {
    if (!config.value) {
      return nextConfig
    }

    // channelId 3/4 可能分开返回，合并 site 数组避免 PC/H5 logo 互相覆盖。
    return {
      ...config.value,
      ...nextConfig,
      site: mergeSiteList(config.value.site, nextConfig.site)
    }
  }

  const getConfigValue = <T = unknown>(key: string): T | undefined => {
    if (!config.value || !(key in config.value)) {
      return undefined
    }

    return config.value[key] as T
  }

  const getConfigString = (key: string) => {
    const value = getConfigValue(key)
    return typeof value === 'string' ? value.trim() : ''
  }

  const getPushMessageMqttConfig = (): PushMessageMqttConfig => ({
    host: getConfigString('push.msg.url'),
    username: getConfigString('srqoi342'),
    password: getConfigString('hsdkie')
  })

  const getSiteList = (): DlicghSiteItem[] => {
    return Array.isArray(config.value?.site) ? config.value.site : []
  }

  const getSiteLanguageConfig = (
    channelId: string | number,
    languageCode = getLanguageCode()
  ): DlicghSiteLanguage | undefined => {
    const normalizedChannelId = normalizeSiteChannelId(channelId)
    const normalizedLanguageCode = normalizeSiteLanguageCode(languageCode)
    const siteList = getSiteList()

    // sy/dlicgh 按 channelId 区分 PC(3) / H5(4)，再按当前语言取对应站点图片配置。
    const siteConfig =
      siteList.find(site => normalizeSiteChannelId(site.siteLayoutId) === normalizedChannelId) ??
      siteList[0]
    const languageList = Array.isArray(siteConfig?.siteLanguage) ? siteConfig.siteLanguage : []

    return (
      languageList.find(
        item => normalizeSiteLanguageCode(item.languageCode) === normalizedLanguageCode
      ) ??
      languageList.find(item => item.homeTopVersion) ??
      languageList[0]
    )
  }

  const getHomeTopLogoUrl = (channelId: string | number, languageCode = getLanguageCode()) => {
    return resolveGameImageUrl(getSiteLanguageConfig(channelId, languageCode)?.homeTopVersion)
  }

  const refreshSiteConfig = async (data: DlicghRequest = {}) => {
    // Deduplicate concurrent sy/dlicgh requests; all callers share the same pending promise.
    if (pendingRequest) {
      return pendingRequest.promise
    }

    isLoading.value = true

    const requestPromise = Api.home
      .dlicgh(data)
      .then(res => {
        const result = res?.result as unknown

        if (!result || typeof result !== 'object' || Array.isArray(result)) {
          return setConfigState(null)
        }

        return setConfigState(mergeSiteConfig(result as SiteConfig))
      })
      .catch(error => {
        console.error(error)
        return config.value
      })
      .finally(() => {
        isLoading.value = false
        isInitialized.value = true
        pendingRequest = null
      })

    pendingRequest = {
      promise: requestPromise
    }

    return requestPromise
  }

  const initSiteConfig = async (data: DlicghRequest = {}) => {
    syncStoredConfig()

    // Once initialized, reuse the cached config and avoid requesting sy/dlicgh again.
    if (isInitialized.value) {
      return config.value
    }

    return refreshSiteConfig(data)
  }

  return {
    config,
    isLoading,
    isInitialized,
    setConfigState,
    syncStoredConfig,
    getConfigValue,
    getConfigString,
    getPushMessageMqttConfig,
    getSiteLanguageConfig,
    getHomeTopLogoUrl,
    initSiteConfig,
    refreshSiteConfig
  }
})
