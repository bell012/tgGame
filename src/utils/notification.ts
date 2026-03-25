/**
 * 统一格式化通知时间戳，异常值回退为 Just now。
 */
export const formatNotificationTime = (timestamp?: number) => {
  if (!timestamp || timestamp <= 1) {
    return 'Just now'
  }

  const normalizedTimestamp = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp
  const date = new Date(normalizedTimestamp)

  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) {
    return 'Just now'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
