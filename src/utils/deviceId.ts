/**
 * 设备唯一标识管理工具
 * 用于生成和管理设备的唯一 TraceId
 */

const DEVICE_ID_KEY = 'device_trace_id'

/**
 * 生成设备指纹
 * 基于浏览器特征生成一个相对稳定的设备标识
 */
function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  let fingerprint = ''

  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device Fingerprint', 2, 2)
    fingerprint = canvas.toDataURL()
  }

  // 收集浏览器特征
  const features = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    fingerprint
  ].join('|')

  let hash = 0
  for (let i = 0; i < features.length; i++) {
    const char = features.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return Math.abs(hash).toString(36)
}

/**
 * 获取或生成设备 TraceId
 * 如果本地存储中已有，则返回已有的；否则生成新的并存储
 */
export function getDeviceTraceId(): string {
  let traceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!traceId) {
    const timestamp = Date.now().toString(36)
    const fingerprint = generateDeviceFingerprint()
    const random = Math.random().toString(36).substring(2, 10)

    traceId = `${timestamp}-${fingerprint}-${random}`
    localStorage.setItem(DEVICE_ID_KEY, traceId)
  }

  return traceId
}

/**
 * 重置设备 TraceId
 */
export function resetDeviceTraceId(): void {
  localStorage.removeItem(DEVICE_ID_KEY)
}
