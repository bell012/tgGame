const CONVERTIBLE_IMAGE_PATTERN = /\.(png|jpe?g)(\?.*)?(#.*)?$/i

const getImageMimeType = (value: string) => {
  return /\.png(?:\?.*)?(?:#.*)?$/i.test(value) ? 'image/png' : 'image/jpeg'
}

export const canGenerateWebpVariant = (value: string) => {
  return CONVERTIBLE_IMAGE_PATTERN.test(String(value ?? ''))
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
