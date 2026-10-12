const ANDROID_APP_SHELL_CLASS = 'android-app-shell'
const ANDROID_APP_SHELL_OFFSET = '24px'
const APP_SHELL_STORAGE_KEY = 'tg.androidAppShell'
const APP_SHELL_QUERY_KEYS = ['app_shell', 'appShell', 'tg_app_shell']
const APP_SHELL_QUERY_VALUES = new Set(['1', 'true', 'android', 'apk', 'webview'])

function isAndroidUserAgent(userAgent: string) {
  return /Android/i.test(userAgent)
}

function isAndroidWebViewUserAgent(userAgent: string) {
  if (!isAndroidUserAgent(userAgent)) {
    return false
  }

  return /\bwv\b/i.test(userAgent)
}

function hasAppShellQuery(search: string) {
  const params = new URLSearchParams(search)

  return APP_SHELL_QUERY_KEYS.some(key => {
    const value = params.get(key)
    return value !== null && APP_SHELL_QUERY_VALUES.has(value.trim().toLowerCase())
  })
}

function hasStoredAppShellFlag() {
  try {
    return localStorage.getItem(APP_SHELL_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function persistAppShellFlag() {
  try {
    localStorage.setItem(APP_SHELL_STORAGE_KEY, '1')
  } catch {
    // Storage can be unavailable in some embedded WebViews.
  }
}

function clearAppShellFlag() {
  try {
    localStorage.removeItem(APP_SHELL_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in some embedded WebViews.
  }
}

export function initAndroidAppShellSafeArea() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return
  }

  const queryMatched = hasAppShellQuery(window.location.search)
  const webViewMatched = isAndroidWebViewUserAgent(navigator.userAgent)
  const storedMatched = hasStoredAppShellFlag() && webViewMatched
  const shellMatched = queryMatched || storedMatched || webViewMatched

  if (!shellMatched) {
    clearAppShellFlag()
    return
  }

  if (queryMatched) {
    persistAppShellFlag()
  }

  const root = document.documentElement
  root.classList.add(ANDROID_APP_SHELL_CLASS)
  root.style.setProperty('--app-shell-top-safe-offset', ANDROID_APP_SHELL_OFFSET)
}
