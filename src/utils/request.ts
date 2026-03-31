import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { getDeviceTraceId } from './deviceId'
import { AESUtils } from './encrypt'
import { getLanguageCode as getLocaleLanguageCode } from './locale'
import i18n from '@/i18n'
import CryptoJS from 'crypto-js'
import { showToast } from 'vant'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const AUTH_EXPIRED_RESPONSE_CODES = new Set(['C6', 'C10', 'C37'])
const MANUAL_LOGOUT_SUPPRESSION_STORAGE_KEY = 'manualLogoutSuppressedUntil'
const MANUAL_LOGOUT_SUPPRESSION_MS = 5000

let isHandlingAuthExpired = false

const getStoredManualLogoutSuppressedUntil = () => {
  if (typeof window === 'undefined') {
    return 0
  }

  const storedValue = window.sessionStorage.getItem(MANUAL_LOGOUT_SUPPRESSION_STORAGE_KEY)
  const parsedValue = storedValue ? Number(storedValue) : 0

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

let manualLogoutSuppressedUntil = getStoredManualLogoutSuppressedUntil()

const clearManualLogoutSuppression = () => {
  manualLogoutSuppressedUntil = 0

  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(MANUAL_LOGOUT_SUPPRESSION_STORAGE_KEY)
  }
}

const isManualLogoutInProgress = () => {
  const now = Date.now()

  if (manualLogoutSuppressedUntil <= now) {
    manualLogoutSuppressedUntil = getStoredManualLogoutSuppressedUntil()
  }

  if (manualLogoutSuppressedUntil <= now) {
    clearManualLogoutSuppression()
    return false
  }

  return true
}

export function setManualLogoutInProgress(value: boolean) {
  if (!value) {
    clearManualLogoutSuppression()
    return
  }

  manualLogoutSuppressedUntil = Date.now() + MANUAL_LOGOUT_SUPPRESSION_MS

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(
      MANUAL_LOGOUT_SUPPRESSION_STORAGE_KEY,
      String(manualLogoutSuppressedUntil)
    )
  }
}

const service: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 获取当前语言代码
 */
export function getLanguageCode(): string {
  return getLocaleLanguageCode()
}

/**
 * 处理 x-auth-token 生成 Authorization
 * 1. 取 content-lengths 的最后一位数字
 * 2. 从 x-auth-token 中去除所有包含该数字的字符
 * 3. 进行 MD5 加密
 */
export function generateAuthorization(): string {
  try {
    const contentLength = localStorage.getItem('contentLength')
    const xAuthToken = localStorage.getItem('xAuthToken')

    if (!contentLength || !xAuthToken) {
      return ''
    }
    const lastDigit = contentLength.slice(-1)
    const processedToken = xAuthToken.replace(new RegExp(lastDigit, 'g'), '')
    const md5Token = CryptoJS.MD5(processedToken).toString()
    return md5Token
  } catch (error) {
    console.error(error)
    return ''
  }
}

export function buildCommonRequestHeaders(url = ''): Record<string, string> {
  const headers: Record<string, string> = {
    TraceId: getDeviceTraceId(),
    uuid: uuidv4(),
    site: 'gifphcb9',
    sitetime: Date.now().toString(),
    bundleId: '1.0.0',
    languageCode: getLanguageCode(),
    channelId: '1'
  }

  if (!url.includes('/ad/getLoginAndRegisterSetting')) {
    const xAuthToken = localStorage.getItem('xAuthToken')
    if (xAuthToken) {
      headers['X-Auth-Token'] = xAuthToken
    }

    const authorization = generateAuthorization()
    if (authorization) {
      headers.Authorization = authorization
    }
  }

  return headers
}

export function resolveRequestUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, '')
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  return `${normalizedBaseUrl}${normalizedUrl}`
}

export function shouldHandleAuthExpiredCode(code: unknown): code is string {
  return typeof code === 'string' && AUTH_EXPIRED_RESPONSE_CODES.has(code)
}

export function triggerAuthExpiredLogout() {
  if (isHandlingAuthExpired || isManualLogoutInProgress() || typeof window === 'undefined') {
    return
  }

  isHandlingAuthExpired = true

  void import('@/stores/user')
    .then(async ({ useUserStore }) => {
      await useUserStore().handleAuthExpired()
    })
    .catch(error => {
      console.error(error)
    })
    .finally(() => {
      isHandlingAuthExpired = false
    })
}

function getResponseErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }

  return fallback
}

function translateToastMessage(key: string) {
  return i18n.global.t(key)
}

function rejectAuthExpiredResponse(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'code' in payload &&
    shouldHandleAuthExpiredCode(payload.code)
  ) {
    const message =
      'message' in payload && typeof payload.message === 'string' && payload.message
        ? payload.message
        : translateToastMessage('common.sessionExpired')

    triggerAuthExpiredLogout()
    return Promise.reject(new Error(message))
  }

  return null
}

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    config.headers = config.headers || {}
    Object.assign(config.headers, buildCommonRequestHeaders(config.url))

    // 13 位时间戳
    const sitetime = config.headers.sitetime as string

    // 加密请求数据
    if (config.data && config.method === 'post' && !config.skipRequestEncryption) {
      try {
        // 加密 key: site + sitetime 后 8 位
        const site = config.headers.site
        const last8Digits = sitetime.slice(-8)
        const encryptKey = site + last8Digits

        const payloadText =
          typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
        const encryptedData = AESUtils.encryptAES(payloadText, encryptKey)

        if (config.directEncryptedPayload) {
          config.data = encryptedData
        } else {
          config.data = {
            data: encryptedData,
            data1: payloadText,
            keyStr: encryptKey
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.url?.includes('/ad/getLoginAndRegisterSetting')) {
      const xhr = response.request
      if (xhr && xhr.getResponseHeader) {
        const contentLengths = xhr.getResponseHeader('content-lengths')
        const xAuthToken = xhr.getResponseHeader('x-auth-token')
        if (contentLengths && xAuthToken) {
          localStorage.setItem('contentLength', contentLengths)
          localStorage.setItem('xAuthToken', xAuthToken)
        }
      }
    }
    const res = response.data
    if (response.status !== 200) {
      return Promise.reject(new Error(res.message || translateToastMessage('common.requestError')))
    }
    let encryptedString = ''
    if (typeof res === 'string' && res.length > 0) {
      encryptedString = res
    } else if (res && typeof res === 'object' && res.data && typeof res.data === 'string') {
      encryptedString = res.data
    }

    if (encryptedString) {
      try {
        const site = response.config.headers?.site as string
        const sitetime = response.config.headers?.sitetime as string
        if (site && sitetime) {
          const last8Digits = sitetime.slice(-8)
          const decryptKey = site + last8Digits
          const decryptedData = AESUtils.decryptAES(encryptedString, decryptKey)

          const authExpiredError = rejectAuthExpiredResponse(decryptedData)
          if (authExpiredError) {
            return authExpiredError
          }

          return decryptedData
        } else {
          const authExpiredError = rejectAuthExpiredResponse(res)
          if (authExpiredError) {
            return authExpiredError
          }

          return res
        }
      } catch (error) {
        console.error(error)

        const authExpiredError = rejectAuthExpiredResponse(res)
        if (authExpiredError) {
          return authExpiredError
        }

        return res
      }
    }

    const authExpiredError = rejectAuthExpiredResponse(res)
    if (authExpiredError) {
      return authExpiredError
    }

    return res
  },
  (error: AxiosError) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          triggerAuthExpiredLogout()
          break
        case 500:
          showToast({
            message: getResponseErrorMessage(
              error.response?.data,
              translateToastMessage('common.internalServerError')
            ),
            type: 'fail'
          })
          break
        default:
          showToast({
            message: getResponseErrorMessage(
              error.response?.data,
              translateToastMessage('common.unknownError')
            ),
            type: 'fail'
          })
      }
    }

    return Promise.reject(error)
  }
)

export default service
