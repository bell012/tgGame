import type { SportLiveStreamingUrl } from '@/api/interface/sport'

/** 取 LiveStreamingUrl 第一项的 Url；不是 m3u8 时返回空字符串。 */
export function parseLiveStreamUrl(streams: readonly SportLiveStreamingUrl[] | undefined): string {
  const url = Array.isArray(streams) ? streams[0]?.Url : undefined
  if (typeof url !== 'string') {
    return ''
  }
  const text = url.trim()
  if (!text) {
    return ''
  }
  try {
    return new URL(text).pathname.toLowerCase().endsWith('.m3u8') ? text : ''
  } catch {
    return ''
  }
}
