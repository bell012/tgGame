import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { getDeviceTraceId } from './deviceId'
import { AESUtils } from './encrypt'
import { getLanguageCode as getLocaleLanguageCode } from './locale'
import { globalShowToast } from './toast.ts'
import i18n from '@/i18n'
import CryptoJS from 'crypto-js'
import { API_ERROR_CODE_MESSAGES } from '@/constants/api-error-code-messages'
import { isMobileViewport } from '@/composables/useMediaQuery'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const AUTH_EXPIRED_RESPONSE_CODES = new Set(['C6', 'C10', 'C37'])
const MANUAL_LOGOUT_SUPPRESSION_STORAGE_KEY = 'manualLogoutSuppressedUntil'
const MANUAL_LOGOUT_SUPPRESSION_MS = 5000

let isHandlingAuthExpired = false

export type ApiResponsePayload = {
  code?: unknown
  message?: string
  success?: boolean
}

export type ApiResponseToastOptions = {
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    showSuccessToast?: boolean
    showErrorToast?: boolean
    skipRequestEncryption?: boolean
    directEncryptedPayload?: boolean
  }
}

type RequestConfigWithToastOptions = InternalAxiosRequestConfig

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

export function getRequestChannelId(): '3' | '4' {
  return isMobileViewport() ? '4' : '3'
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
    channelId: getRequestChannelId() // 注册终端  1:竖版  2:横版  3:PC 4:H5  5:其他
  }

  if (!url.includes('/bd/getLoginAndRegisterSetting')) {
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
    return (
      translateApiMessageByCode('code' in data ? data.code : undefined, data.message) || fallback
    )
  }

  return fallback
}

function translateToastMessage(key: string) {
  return i18n.global.t(key)
}

function resolveApiMessageLocale() {
  return getLanguageCode() === 'zh' ? 'zh' : 'eng'
}

export function translateApiMessageByCode(code: unknown, fallbackMessage = '') {
  if (typeof code !== 'string') {
    return fallbackMessage
  }

  const localizedMessages = API_ERROR_CODE_MESSAGES[code as keyof typeof API_ERROR_CODE_MESSAGES]

  if (!localizedMessages) {
    return fallbackMessage
  }

  return resolveApiMessageLocale() === 'zh' ? localizedMessages[1] : localizedMessages[0]
}

export function normalizeApiResponseMessage<T extends ApiResponsePayload>(payload: T): T {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  const translatedMessage = translateApiMessageByCode(payload.code, payload.message || '')

  if (translatedMessage) {
    payload.message = translatedMessage
  }

  return payload
}

function isApiResponseSuccess(payload: ApiResponsePayload) {
  if (typeof payload.code === 'string') {
    return payload.code === 'C2'
  }

  if (typeof payload.success === 'boolean') {
    return payload.success
  }

  return false
}

export function showApiResponseToast(
  payload: ApiResponsePayload,
  options?: ApiResponseToastOptions
) {
  if (!payload?.message) {
    return
  }

  const isSuccess = isApiResponseSuccess(payload)

  if (isSuccess) {
    if (options?.showSuccessToast === false) {
      return
    }

    globalShowToast({
      message: payload.message,
      type: 'success',
      zIndex: 999999
    })
    return
  }

  if (options?.showErrorToast === false) {
    return
  }

  globalShowToast({
    message: payload.message,
    type: 'fail',
    zIndex: 999999
  })
}

/**
 * 遇到登录失效类业务码时，先补失败提示，再执行统一登录失效处理。
 */
function rejectAuthExpiredResponse(payload: unknown, options?: ApiResponseToastOptions) {
  if (
    payload &&
    typeof payload === 'object' &&
    'code' in payload &&
    shouldHandleAuthExpiredCode(payload.code)
  ) {
    const normalizedPayload = normalizeApiResponseMessage(payload)
    const message =
      'message' in normalizedPayload &&
      typeof normalizedPayload.message === 'string' &&
      normalizedPayload.message
        ? normalizedPayload.message
        : translateToastMessage('common.sessionExpired')

    if (options?.showErrorToast !== false) {
      globalShowToast({
        message,
        type: 'fail',
        zIndex: 999999
      })
    }

    triggerAuthExpiredLogout()
    return Promise.reject(new Error(message))
  }

  return null
}

function finalizeApiResponse<T extends ApiResponsePayload>(
  payload: T,
  options?: ApiResponseToastOptions
) {
  const normalizedPayload = normalizeApiResponseMessage(payload)
  const authExpiredError = rejectAuthExpiredResponse(normalizedPayload, options)

  if (authExpiredError) {
    return authExpiredError
  }

  showApiResponseToast(normalizedPayload, options)
  return normalizedPayload
}

// 请求拦截器
service.interceptors.request.use(
  (config: RequestConfigWithToastOptions) => {
    const headers = (config.headers || {}) as Record<string, unknown>
    const explicitHeaders = { ...headers }
    // 允许单个接口覆盖公共头，例如代理接口需要区分 PC=3、H5=4。
    Object.assign(headers, buildCommonRequestHeaders(config.url), explicitHeaders)
    config.headers = headers as RequestConfigWithToastOptions['headers']

    // 13 位时间戳
    const sitetime = String(headers.sitetime || '')

    // 加密请求数据
    if (config.data && config.method === 'post' && !config.skipRequestEncryption) {
      try {
        // 加密 key: site + sitetime 后 8 位
        const site = String(headers.site || '')
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
    if (response.config.url?.includes('/bd/getLoginAndRegisterSetting')) {
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

          return finalizeApiResponse(
            decryptedData,
            response.config as RequestConfigWithToastOptions
          )
        } else {
          return finalizeApiResponse(res, response.config as RequestConfigWithToastOptions)
        }
      } catch (error) {
        console.error(error)

        return finalizeApiResponse(res, response.config as RequestConfigWithToastOptions)
      }
    }

    return finalizeApiResponse(res, response.config as RequestConfigWithToastOptions)
  },
  (error: AxiosError) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          triggerAuthExpiredLogout()
          break
        case 500:
          globalShowToast({
            message: getResponseErrorMessage(
              error.response?.data,
              translateToastMessage('common.internalServerError')
            ),
            type: 'fail',
            zIndex: 999999
          })
          break
        default:
          globalShowToast({
            message: getResponseErrorMessage(
              error.response?.data,
              translateToastMessage('common.unknownError')
            ),
            type: 'fail',
            zIndex: 999999
          })
      }
    }

    return Promise.reject(error)
  }
)

export default service
