/** H5 页面可用的运行环境类型。 */
export type WebRuntimeEnvironment = 'android-web' | 'ios-web' | 'ios-bookmark' | 'desktop-web'

type IosNavigator = Navigator & {
  standalone?: boolean
}

function isIosUserAgent(userAgent: string) {
  return /iPad|iPhone|iPod/i.test(userAgent)
}

/**
 * 判断当前 H5 的运行环境。
 *
 * iPadOS 13+ 可能以 Macintosh UA 上报，因此还需通过多点触控能力识别 iPad；
 * iOS 从主屏幕打开时优先返回 `ios-bookmark`。
 */
export function getWebRuntimeEnvironment(): WebRuntimeEnvironment {
  if (typeof navigator === 'undefined') {
    return 'desktop-web'
  }

  const userAgent = navigator.userAgent
  const isIos =
    isIosUserAgent(userAgent) || (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)

  if (isIos) {
    const iosNavigator = navigator as IosNavigator
    const isBookmark =
      iosNavigator.standalone === true ||
      (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches)

    return isBookmark ? 'ios-bookmark' : 'ios-web'
  }

  if (/Android/i.test(userAgent)) {
    return 'android-web'
  }

  return 'desktop-web'
}
