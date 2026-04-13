/**
 * 登录、注册、短信验证码
 */

import request from '@/utils/request'
import type {
  LoginSetResponse,
  LoginForm,
  LoginResponse,
  RegisterForm,
  RegisterResponse,
  SmsForm,
  SmsResponse,
  ResetPasswordForm,
  ResetPasswordResponse,
  CheckSmsForm,
  CheckSmsResponse
} from '@/api/interface/login_register'

/**
 * 登陆注册设置
 * @param data 登陆注册设置数据
 * @returns Promise<LoginSetResponse>
 */
export function getLoginAndRegisterSetting(data: {}): Promise<LoginSetResponse> {
  return request({
    url: '/ad/getLoginAndRegisterSetting',
    method: 'post',
    data,
    showSuccessToast: false, // 不显示成功轻提示
    showErrorToast: false // 不显示失败轻提示
  })
}

/**
 * 会员登录
 * @param data 登录表单数据
 * @returns Promise<LoginResponse>
 */
export function login(data: LoginForm): Promise<LoginResponse> {
  return request({
    url: '/mc/loginMember',
    method: 'post',
    data,
    showSuccessToast: true, // 显示成功轻提示
    showErrorToast: true // 显示失败轻提示
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
    data,
    showSuccessToast: true,
    showErrorToast: true
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
    data,
    showSuccessToast: true,
    showErrorToast: true
  })
}
/**
 * 短信验证码 验证
 * @param data 短信验证码 验证 数据
 * @returns Promise<CheckSmsResponse>
 */
export function checkSms(data: CheckSmsForm): Promise<CheckSmsResponse> {
  return request({
    url: '/sy/checkSms',
    method: 'post',
    data,
    showSuccessToast: true,
    showErrorToast: true
  })
}

/**
 * 重置密码
 * @param data 重置密码表单数据
 * @returns Promise<ResetPasswordResponse>
 */
export function resetPassword(data: ResetPasswordForm): Promise<ResetPasswordResponse> {
  return request({
    url: '/mc/resetPassword',
    method: 'post',
    data,
    showSuccessToast: true,
    showErrorToast: true
  })
}
