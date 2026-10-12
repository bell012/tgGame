const ANDROID_APP_SHELL_CLASS = 'android-app-shell'
const ANDROID_APP_SHELL_OFFSET = '24px'
const APP_SHELL_STORAGE_KEY = 'tg.androidAppShell'
const APP_SHELL_QUERY_KEYS = ['app_shell', 'appShell', 'tg_app_shell']
const APP_SHELL_QUERY_VALUES = new Set(['1', 'true', 'android', 'apk', 'webview'])
const APP_SHELL_QUERY_DISABLED_VALUES = new Set(['0', 'false', 'off', 'browser'])
const APP_SHELL_USER_AGENT_PATTERN = /TGGameApp|TG\.GAME App|TG_APP_SHELL|AndroidAppShell/i

type AppShellWindow = Window &
  typeof globalThis & {
    TG_APP_SHELL?: boolean | string
    __TG_APP_SHELL__?: boolean | string
    Android?: unknown
    ReactNativeWebView?: unknown
  }

function isAndroidUserAgent(userAgent: string) {
  return /Android/i.test(userAgent)
}

function hasAppShellQueryValue(search: string, values: Set<string>) {
  const params = new URLSearchParams(search)

  return APP_SHELL_QUERY_KEYS.some(key => {
    const value = params.get(key)
    return value !== null && values.has(value.trim().toLowerCase())
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

function hasNativeAppShellSignal(win: AppShellWindow) {
  return (
    win.TG_APP_SHELL === true ||
    win.TG_APP_SHELL === '1' ||
    win.__TG_APP_SHELL__ === true ||
    win.__TG_APP_SHELL__ === '1' ||
    !!win.ReactNativeWebView ||
    !!win.Android
  )
}

function applyAppShellSafeArea() {
  const root = document.documentElement
  root.classList.add(ANDROID_APP_SHELL_CLASS)
  root.style.setProperty('--app-shell-top-safe-offset', ANDROID_APP_SHELL_OFFSET)
}

export function initAndroidAppShellSafeArea() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return
  }

  const appWindow = window as AppShellWindow
  const disabledByQuery = hasAppShellQueryValue(
    window.location.search,
    APP_SHELL_QUERY_DISABLED_VALUES
  )
  const queryMatched = hasAppShellQueryValue(window.location.search, APP_SHELL_QUERY_VALUES)
  const nativeSignalMatched = hasNativeAppShellSignal(appWindow)
  const customUaMatched =
    isAndroidUserAgent(navigator.userAgent) &&
    APP_SHELL_USER_AGENT_PATTERN.test(navigator.userAgent)
  const storedMatched = hasStoredAppShellFlag()
  const shellMatched =
    !disabledByQuery && (queryMatched || storedMatched || nativeSignalMatched || customUaMatched)

  if (!shellMatched) {
    clearAppShellFlag()
    return
  }

  if (queryMatched || nativeSignalMatched || customUaMatched) {
    persistAppShellFlag()
  }

  applyAppShellSafeArea()

  window.setTimeout(() => {
    if (hasNativeAppShellSignal(appWindow)) {
      persistAppShellFlag()
      applyAppShellSafeArea()
    }
  }, 0)
}
