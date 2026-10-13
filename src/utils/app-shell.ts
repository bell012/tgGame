const ANDROID_APP_SHELL_CLASS = 'android-app-shell'
const ANDROID_APP_SHELL_OFFSET = '24px'
const APP_SHELL_STORAGE_KEY = 'tg.androidAppShell'
const APP_SHELL_SESSION_KEY = 'tg.androidAppShell.session'
const APP_SHELL_COOKIE_KEY = 'tg_android_app_shell'
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

export interface AndroidAppShellDebugInfo {
  href: string
  search: string
  hash: string
  userAgent: string
  searchCandidates: string[]
  appShellAndroidQueryMatched: boolean
  disabledByQuery: boolean
  queryMatched: boolean
  androidUserAgentMatched: boolean
  androidWebViewUaMatched: boolean
  customUaMatched: boolean
  nativeSignalMatched: boolean
  sessionStoredMatched: boolean
  persistentStoredMatched: boolean
  shellMatched: boolean
  htmlClassMatched: boolean
  bodyClassMatched: boolean
  appClassMatched: boolean
  htmlSafeOffset: string
  bodySafeOffset: string
  appSafeOffset: string
}

function isAndroidUserAgent(userAgent: string) {
  return /Android/i.test(userAgent)
}

function isAndroidWebViewUserAgent(userAgent: string) {
  if (!isAndroidUserAgent(userAgent)) {
    return false
  }

  return (
    /;\s*wv\)/i.test(userAgent) ||
    /\bwv\b/i.test(userAgent) ||
    /Version\/[\d.]+.*Chrome\/[\d.]+.*Mobile Safari/i.test(userAgent)
  )
}

function getSearchCandidates(win: AppShellWindow) {
  const candidates = new Set<string>()
  const { location } = win

  if (location.search) {
    candidates.add(location.search)
  }

  try {
    const currentUrl = new URL(location.href)
    if (currentUrl.search) {
      candidates.add(currentUrl.search)
    }
  } catch {
    // Some embedded WebViews can expose a partially encoded href.
  }

  const hash = location.hash.replace(/^#/, '')
  const hashQueryIndex = hash.indexOf('?')

  if (hashQueryIndex >= 0) {
    candidates.add(hash.slice(hashQueryIndex))
  } else if (hash.startsWith('?')) {
    candidates.add(hash)
  }

  return Array.from(candidates)
}

function hasAppShellQueryValue(win: AppShellWindow, values: Set<string>) {
  return getSearchCandidates(win).some(search => hasQueryValue(search, values))
}

function hasQueryValue(search: string, values: Set<string>) {
  const params = new URLSearchParams(search)

  return APP_SHELL_QUERY_KEYS.some(key => {
    const value = params.get(key)
    return value !== null && values.has(value.trim().toLowerCase())
  })
}

function hasExactAppShellAndroidQuery(win: AppShellWindow) {
  return getSearchCandidates(win).some(search => {
    const params = new URLSearchParams(search)
    return params.get('app_shell')?.trim().toLowerCase() === 'android'
  })
}

function hasSessionAppShellFlag() {
  try {
    return sessionStorage.getItem(APP_SHELL_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function hasPersistentAppShellFlag() {
  try {
    if (localStorage.getItem(APP_SHELL_STORAGE_KEY) === '1') {
      return true
    }
  } catch {
    // Storage can be unavailable in some embedded WebViews.
  }

  try {
    return document.cookie.split(';').some(item => item.trim() === `${APP_SHELL_COOKIE_KEY}=1`)
  } catch {
    return false
  }
}

function persistAppShellFlag() {
  try {
    sessionStorage.setItem(APP_SHELL_SESSION_KEY, '1')
  } catch {
    // Storage can be unavailable in some embedded WebViews.
  }

  try {
    localStorage.setItem(APP_SHELL_STORAGE_KEY, '1')
  } catch {
    // Storage can be unavailable in some embedded WebViews.
  }

  try {
    document.cookie = `${APP_SHELL_COOKIE_KEY}=1; path=/; max-age=31536000; SameSite=Lax`
  } catch {
    // Cookies can be unavailable in some embedded WebViews.
  }
}

function clearAppShellFlag() {
  try {
    sessionStorage.removeItem(APP_SHELL_SESSION_KEY)
  } catch {
    // Storage can be unavailable in some embedded WebViews.
  }

  try {
    localStorage.removeItem(APP_SHELL_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in some embedded WebViews.
  }

  try {
    document.cookie = `${APP_SHELL_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`
  } catch {
    // Cookies can be unavailable in some embedded WebViews.
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

function getAppShellSafeAreaTargets() {
  const targets: HTMLElement[] = [document.documentElement]

  if (document.body) {
    targets.push(document.body)
  }

  const app = document.getElementById('app')
  if (app) {
    targets.push(app)
  }

  return targets
}

function applyAppShellSafeArea() {
  getAppShellSafeAreaTargets().forEach(target => {
    target.classList.add(ANDROID_APP_SHELL_CLASS)
    target.style.setProperty('--app-shell-top-safe-offset', ANDROID_APP_SHELL_OFFSET)
  })
}

function removeAppShellSafeArea() {
  getAppShellSafeAreaTargets().forEach(target => {
    target.classList.remove(ANDROID_APP_SHELL_CLASS)
    target.style.removeProperty('--app-shell-top-safe-offset')
  })
}

function scheduleAppShellSafeAreaReapply() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAppShellSafeArea, { once: true })
  }

  window.setTimeout(applyAppShellSafeArea, 0)
}

function resolveAppShellMatchState() {
  const appWindow = window as AppShellWindow
  const userAgent = navigator.userAgent
  const disabledByQuery = hasAppShellQueryValue(appWindow, APP_SHELL_QUERY_DISABLED_VALUES)
  const queryMatched = hasAppShellQueryValue(appWindow, APP_SHELL_QUERY_VALUES)
  const nativeSignalMatched = hasNativeAppShellSignal(appWindow)
  const customUaMatched =
    isAndroidUserAgent(userAgent) && APP_SHELL_USER_AGENT_PATTERN.test(userAgent)
  const androidUserAgentMatched = isAndroidUserAgent(userAgent)
  const androidWebViewUaMatched = isAndroidWebViewUserAgent(userAgent)
  const sessionStoredMatched = hasSessionAppShellFlag()
  const persistentStoredMatched = hasPersistentAppShellFlag()
  const storedMatched = sessionStoredMatched || persistentStoredMatched
  const persistentStoredMatchedInShellLikeEnv =
    persistentStoredMatched && (nativeSignalMatched || customUaMatched || androidWebViewUaMatched)
  const shellMatched =
    !disabledByQuery &&
    (queryMatched ||
      sessionStoredMatched ||
      persistentStoredMatchedInShellLikeEnv ||
      nativeSignalMatched ||
      customUaMatched ||
      androidWebViewUaMatched)

  return {
    appWindow,
    userAgent,
    disabledByQuery,
    queryMatched,
    nativeSignalMatched,
    customUaMatched,
    androidUserAgentMatched,
    androidWebViewUaMatched,
    sessionStoredMatched,
    persistentStoredMatched,
    storedMatched,
    shellMatched
  }
}

export function getAndroidAppShellDebugInfo(): AndroidAppShellDebugInfo | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null
  }

  const state = resolveAppShellMatchState()
  const app = document.getElementById('app')

  return {
    href: window.location.href,
    search: window.location.search,
    hash: window.location.hash,
    userAgent: state.userAgent,
    searchCandidates: getSearchCandidates(state.appWindow),
    appShellAndroidQueryMatched: hasExactAppShellAndroidQuery(state.appWindow),
    disabledByQuery: state.disabledByQuery,
    queryMatched: state.queryMatched,
    androidUserAgentMatched: state.androidUserAgentMatched,
    androidWebViewUaMatched: state.androidWebViewUaMatched,
    customUaMatched: state.customUaMatched,
    nativeSignalMatched: state.nativeSignalMatched,
    sessionStoredMatched: state.sessionStoredMatched,
    persistentStoredMatched: state.persistentStoredMatched,
    shellMatched: state.shellMatched,
    htmlClassMatched: document.documentElement.classList.contains(ANDROID_APP_SHELL_CLASS),
    bodyClassMatched: document.body?.classList.contains(ANDROID_APP_SHELL_CLASS) ?? false,
    appClassMatched: app?.classList.contains(ANDROID_APP_SHELL_CLASS) ?? false,
    htmlSafeOffset: document.documentElement.style.getPropertyValue('--app-shell-top-safe-offset'),
    bodySafeOffset: document.body?.style.getPropertyValue('--app-shell-top-safe-offset') ?? '',
    appSafeOffset: app?.style.getPropertyValue('--app-shell-top-safe-offset') ?? ''
  }
}

export function initAndroidAppShellSafeArea() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return
  }

  const state = resolveAppShellMatchState()

  if (state.disabledByQuery) {
    clearAppShellFlag()
    removeAppShellSafeArea()
    return
  }

  if (!state.shellMatched) {
    if (state.storedMatched) {
      clearAppShellFlag()
      removeAppShellSafeArea()
    }
    return
  }

  persistAppShellFlag()

  applyAppShellSafeArea()
  scheduleAppShellSafeAreaReapply()

  window.setTimeout(() => {
    if (hasNativeAppShellSignal(state.appWindow)) {
      persistAppShellFlag()
      applyAppShellSafeArea()
    }
  }, 0)
}
