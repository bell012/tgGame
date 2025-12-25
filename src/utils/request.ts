import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

