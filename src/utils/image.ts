const CONVERTIBLE_IMAGE_PATTERN = /\.(png|jpe?g)(\?.*)?(#.*)?$/i
const REMOTE_URL_PATTERN = /^https?:\/\//i
const ABSOLUTE_IMAGE_URL_PATTERN = /^(data:|blob:|https?:\/\/)/i
const SITE_CONFIG_STORAGE_KEY = 'config'

const getImageMimeType = (value: string) => {
  return /\.png(?:\?.*)?(?:#.*)?$/i.test(value) ? 'image/png' : 'image/jpeg'
}

const readSiteConfigValue = <T = unknown>(key: string): T | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const storedValue = window.localStorage.getItem(SITE_CONFIG_STORAGE_KEY)
  if (!storedValue) {
    return undefined
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Record<string, unknown>
    return parsedValue?.[key] as T | undefined
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const getGameImageBaseUrl = () => {
  // ossDomain is cached from sy/dlicgh by siteConfig store, so image helpers do not read env.
  const baseSiteConfig = readSiteConfigValue<Record<string, unknown>>('baseSiteConfig')
  const ossDomain = String(baseSiteConfig?.ossDomain ?? readSiteConfigValue('ossDomain') ?? '')
    .trim()
    .replace(/\/+$/, '')

  return ossDomain
}

export const resolveGameImageUrl = (value: unknown) => {
  const imagePath = String(value ?? '').trim()

  if (!imagePath) {
    return ''
  }

  if (ABSOLUTE_IMAGE_URL_PATTERN.test(imagePath)) {
    return imagePath
  }

  const baseUrl = getGameImageBaseUrl()
  if (!baseUrl) {
    return imagePath
  }

  return `${baseUrl}/${imagePath.replace(/^\/+/, '')}`
}

/** CDN / 外链不保证存在同名 .webp，禁止靠改扩展名猜测 */
const isRemoteImageWithoutWebpTwin = (source: string) => {
  if (REMOTE_URL_PATTERN.test(source)) {
    return true
  }

  const gameImageBaseUrl = getGameImageBaseUrl()
  return Boolean(gameImageBaseUrl && source.startsWith(gameImageBaseUrl))
}

export const canGenerateWebpVariant = (value: string) => {
  const source = String(value ?? '').trim()
  if (!source || isRemoteImageWithoutWebpTwin(source)) {
    return false
  }

  return CONVERTIBLE_IMAGE_PATTERN.test(source)
}

export const resolveWebpUrl = (value: string) => {
  const source = String(value ?? '')

  if (!import.meta.env.PROD || !canGenerateWebpVariant(source)) {
    return ''
  }

  return source.replace(CONVERTIBLE_IMAGE_PATTERN, '.webp$2$3')
}

export const resolveImageUrl = (value: string) => {
  return String(value ?? '')
}

export const resolveBackgroundImage = (value: string) => {
  const source = resolveImageUrl(value)

  if (!source) {
    return ''
  }

  const webpSource = resolveWebpUrl(source)

  if (!webpSource) {
    return `url("${source}")`
  }

  return `image-set(url("${webpSource}") type("image/webp"), url("${source}") type("${getImageMimeType(source)}"))`
}
