type TranslateFn = (key: string) => string

const isPayloadTooLargeMessage = (message: string) => {
  const normalizedMessage = message.trim().toLowerCase()

  return (
    normalizedMessage.includes('413 request entity too large') ||
    normalizedMessage.includes('request entity too large') ||
    normalizedMessage.includes('413 payload too large') ||
    normalizedMessage.includes('payload too large')
  )
}

const isHtmlErrorMessage = (message: string) => {
  const normalizedMessage = message.trim().toLowerCase()

  return (
    normalizedMessage.startsWith('<!doctype') ||
    normalizedMessage.startsWith('<html') ||
    normalizedMessage.includes('<body')
  )
}

const isNetworkLoadFailedMessage = (message: string) => {
  return message.trim().toLowerCase() === 'load failed'
}

export const resolveUploadErrorMessage = (
  error: unknown,
  t: TranslateFn,
  fallbackMessage: string
) => {
  const rawMessage =
    error instanceof Error ? error.message : typeof error === 'string' ? error : fallbackMessage

  if (typeof rawMessage === 'string') {
    if (
      isPayloadTooLargeMessage(rawMessage) ||
      isNetworkLoadFailedMessage(rawMessage) ||
      isHtmlErrorMessage(rawMessage)
    ) {
      return t('common.upload_file_too_large_failed')
    }
  }

  return rawMessage || fallbackMessage
}
