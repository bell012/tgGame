import request from '@/utils/request'

export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export const login = (data: { username: string; password: string }) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

