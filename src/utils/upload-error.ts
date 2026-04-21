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

export const resolveUploadErrorMessage = (
  error: unknown,
  t: TranslateFn,
  fallbackMessage: string
) => {
  const rawMessage =
    error instanceof Error ? error.message : typeof error === 'string' ? error : fallbackMessage

  if (typeof rawMessage === 'string' && isPayloadTooLargeMessage(rawMessage)) {
    return t('common.upload_file_too_large_failed')
  }

  return rawMessage || fallbackMessage
}
