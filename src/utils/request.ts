import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { getDeviceTraceId } from './deviceId'
import { AESUtils } from './encrypt'
import { StringExtension } from './string-extension'

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

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const requestUuid = uuidv4()
    // 公共请求头
    config.headers.TraceId = getDeviceTraceId()
    config.headers.uuid = requestUuid
    config.headers.site = 'gifphcb9'
    config.headers.bundleId = '1.0.0'
    config.headers.languageCode = getLanguageCode()
    config.headers.channelId = '1'

    // 加密请求数据
    if (config.data && config.method === 'post') {
      try {
        const md5Uuid = StringExtension.md5(requestUuid)
        const encryptKey = StringExtension.tail16(md5Uuid)
        const jsonData = JSON.stringify(config.data)
        const encryptedData = AESUtils.encryptAES(jsonData, encryptKey)
        config.data = encryptedData
        config.headers['Content-Type'] = 'text/plain'
      } catch (error) {
        console.error(error)
      }
    }

    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (response.status !== 200) {
      console.error('Response error:', res.message || 'Error')
      return Promise.reject(new Error(res.message || 'Error'))
    }

    // 解密响应数据
    if (typeof res === 'string' && res.length > 0) {
      try {
        const requestUuid = response.config.headers?.uuid as string
        if (requestUuid) {
          const md5Uuid = StringExtension.md5(requestUuid)
          const decryptKey = StringExtension.tail16(md5Uuid)
          const decryptedData = AESUtils.decryptAES(res, decryptKey)
          return decryptedData
        }
      } catch (error) {
        console.error(error)
        return res
      }
    }

    return res
  },
  (error: AxiosError) => {
    console.error('Response error:', error)

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
