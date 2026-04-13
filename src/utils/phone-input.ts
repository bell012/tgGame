/**
 * 手机号和密码输入相关工具函数
 */

/**
 * 格式化菲律宾手机号：去除区号/前导 0 后，仅保留 9 开头的 10 位号码
 * @param value 输入的字符串
 * @returns 格式化后的纯数字字符串（9 开头，最多10位）
 */
export const formatPhoneNumber = (value: string): string => {
  let digitsOnly = value.replace(/\D/g, '')

  if (digitsOnly.startsWith('63')) {
    digitsOnly = digitsOnly.slice(2)
  }

  if (digitsOnly.startsWith('0')) {
    digitsOnly = digitsOnly.slice(1)
  }

  if (digitsOnly && !digitsOnly.startsWith('9')) {
    const firstMobileDigitIndex = digitsOnly.indexOf('9')
    digitsOnly = firstMobileDigitIndex >= 0 ? digitsOnly.slice(firstMobileDigitIndex) : ''
  }

  return digitsOnly.slice(0, 10)
}

/**
 * 验证菲律宾手机号是否符合 9 开头且共 10 位数字的规则。
 */
export const isValidPhoneNumber = (value: string): boolean => /^9\d{9}$/.test(value)

/**
 * 处理手机号输入事件
 * @param event 输入事件
 * @param callback 回调函数，用于更新表单数据
 */
export const handlePhoneInput = (event: Event, callback: (value: string) => void) => {
  const input = event.target as HTMLInputElement
  const formatted = formatPhoneNumber(input.value)
  callback(formatted)
  input.value = formatted
}

/**
 * 格式化密码：只保留字母和数字，6-16位
 * @param value 输入的字符串
 * @returns 格式化后的字符串（只包含字母和数字，最多16位）
 */
export const formatPassword = (value: string): string => {
  const alphanumericOnly = value.replace(/[^a-zA-Z0-9]/g, '')
  return alphanumericOnly.slice(0, 16)
}

/**
 * 验证密码是否符合要求：6-16位，必须同时包含字母和数字
 * @param value 密码字符串
 * @returns 是否符合要求
 */
export const isValidPassword = (value: string): boolean => {
  if (value.length < 6 || value.length > 16) {
    return false
  }
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return false
  }
  // 必须至少包含一个字母
  const hasLetter = /[a-zA-Z]/.test(value)
  // 必须至少包含一个数字
  const hasNumber = /[0-9]/.test(value)

  return hasLetter && hasNumber
}

/**
 * 格式化验证码：只保留数字，最多6位
 * @param value 输入的字符串
 * @returns 格式化后的字符串（只包含数字，最多6位）
 */
export const formatVerificationCode = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly.slice(0, 6)
}

/**
 * 处理验证码输入事件
 */
export const handleVerificationCodeInput = (event: Event, callback: (value: string) => void) => {
  const input = event.target as HTMLInputElement
  const formatted = formatVerificationCode(input.value)
  callback(formatted)
  input.value = formatted
}

/**
 * 处理密码输入事件
 * @param event 输入事件
 * @param callback 回调函数，用于更新表单数据
 */
export const handlePasswordInput = (event: Event, callback: (value: string) => void) => {
  const input = event.target as HTMLInputElement
  const formatted = formatPassword(input.value)
  callback(formatted)
  input.value = formatted
}

/**
 * 格式化昵称：只保留字母和数字，最多20位
 * @param value 输入的字符串
 * @returns 格式化后的昵称
 */
export const formatNickname = (value: string): string => {
  const alphanumericOnly = value.replace(/[^a-zA-Z0-9]/g, '')
  return alphanumericOnly.slice(0, 20)
}

/**
 * 验证昵称是否符合要求：3-20位，只能包含字母和数字
 * @param value 昵称字符串
 * @returns 是否符合要求
 */
export const isValidNickname = (value: string): boolean => {
  return /^[a-zA-Z0-9]{3,20}$/.test(value)
}

/**
 * 处理昵称输入事件
 * @param event 输入事件
 * @param callback 回调函数，用于更新昵称
 */
export const handleNicknameInput = (event: Event, callback: (value: string) => void) => {
  const input = event.target as HTMLInputElement
  const formatted = formatNickname(input.value)
  callback(formatted)
  input.value = formatted
}
