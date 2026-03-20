import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { getDeviceTraceId } from './deviceId'
import { AESUtils } from './encrypt'
import CryptoJS from 'crypto-js'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 获取当前语言代码
 */
function getLanguageCode(): string {
  const language = localStorage.getItem('language') || 'en'
  return language === 'zh-CN' ? 'zh' : 'en'
}

/**
 * 处理 x-auth-token 生成 Authorization
 * 1. 取 content-lengths 的最后一位数字
 * 2. 从 x-auth-token 中去除所有包含该数字的字符
 * 3. 进行 MD5 加密
 */
function generateAuthorization(): string {
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

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    const requestUuid = uuidv4()

    // 13 位时间戳
    const sitetime = Date.now().toString()

    // 公共请求头
    config.headers.TraceId = getDeviceTraceId()
    config.headers.uuid = requestUuid
    config.headers.site = 'gifphcb9'
    config.headers.sitetime = sitetime
    config.headers.bundleId = '1.0.0'
    config.headers.languageCode = getLanguageCode()
    config.headers.channelId = '1'
    if (!config.url?.includes('/ad/getLoginAndRegisterSetting')) {
      const xAuthToken = localStorage.getItem('xAuthToken')
      if (xAuthToken) {
        config.headers['X-Auth-Token'] = xAuthToken
      }
      const authorization = generateAuthorization()
      if (authorization) {
        config.headers.Authorization = authorization
      }
    }

    // 加密请求数据
    if (config.data && config.method === 'post') {
      try {
        // 加密 key: site + sitetime 后 8 位
        const site = config.headers.site
        const last8Digits = sitetime.slice(-8)
        const encryptKey = site + last8Digits

        const jsonData = JSON.stringify(config.data)
        const encryptedData = AESUtils.encryptAES(jsonData, encryptKey)
        config.data = {
          data: encryptedData,
          data1: jsonData,
          keyStr: encryptKey
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
      return Promise.reject(new Error(res.message || 'Error'))
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
          return decryptedData
        } else {
          return res
        }
      } catch (error) {
        console.error(error)
        return res
      }
    }

    return res
  },
  (error: AxiosError) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized')
          break
        case 403:
          console.error('Forbidden')
          break
        case 404:
          console.error('Not Found')
          break
        case 500:
          console.error('Internal Server Error')
          break
        default:
          console.error('Unknown Error')
      }
    }

    return Promise.reject(error)
  }
)

export default service
