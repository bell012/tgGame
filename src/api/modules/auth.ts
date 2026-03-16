/**
 * 登录、注册、短信验证码
 */

import request from '@/utils/request'
import type {
  LoginForm,
  LoginResponse,
  RegisterForm,
  RegisterResponse,
  SmsForm,
  SmsResponse
} from '@/interface/login_register'

/**
 * 会员登录
 * @param data 登录表单数据
 * @returns Promise<LoginResponse>
 */
export function login(data: LoginForm): Promise<LoginResponse> {
  return request({
    url: '/mc/loginMember',
    method: 'post',
    data
  })
}

/**
 * 会员注册
 * @param data 注册表单数据
 * @returns Promise<RegisterResponse>
 */
export function register(data: RegisterForm): Promise<RegisterResponse> {
  return request({
    url: '/mc/newMember',
    method: 'post',
    data
  })
}

/**
 * 发送短信验证码
 * @param data 短信表单数据
 * @returns Promise<SmsResponse>
 */
export function sendSms(data: SmsForm): Promise<SmsResponse> {
  return request({
    url: '/sy/sms',
    method: 'post',
    data
  })
}
