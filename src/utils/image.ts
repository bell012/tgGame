const CONVERTIBLE_IMAGE_PATTERN = /\.(png|jpe?g)(\?.*)?(#.*)?$/i
const REMOTE_URL_PATTERN = /^https?:\/\//i

const getImageMimeType = (value: string) => {
  return /\.png(?:\?.*)?(?:#.*)?$/i.test(value) ? 'image/png' : 'image/jpeg'
}

const getGameImageBaseUrl = () => String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').trim()

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
