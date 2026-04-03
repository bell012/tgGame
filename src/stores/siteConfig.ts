import { defineStore } from 'pinia'
import { ref } from 'vue'
import Api from '@/api'

export const SITE_CONFIG_STORAGE_KEY = 'config'

export type SiteConfig = Record<string, unknown>

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

  let pendingRequest: Promise<SiteConfig | null> | null = null

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

  const refreshSiteConfig = async () => {
    if (pendingRequest) {
      return pendingRequest
    }

    isLoading.value = true

    pendingRequest = Api.home
      .dlicgh({})
      .then(res => {
        const result = res?.result as unknown

        if (!result || typeof result !== 'object' || Array.isArray(result)) {
          return setConfigState(null)
        }

        return setConfigState(result as SiteConfig)
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

    return pendingRequest
  }

  const initSiteConfig = async () => {
    syncStoredConfig()

    if (isInitialized.value) {
      return config.value
    }

    return refreshSiteConfig()
  }

  return {
    config,
    isLoading,
    isInitialized,
    setConfigState,
    syncStoredConfig,
    initSiteConfig,
    refreshSiteConfig
  }
})
