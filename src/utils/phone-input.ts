/**
 * 手机号和密码输入相关工具函数
 */

/**
 * 格式化手机号：只保留数字，最多10位
 * @param value 输入的字符串
 * @returns 格式化后的纯数字字符串（最多10位）
 */
export const formatPhoneNumber = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly.slice(0, 10)
}

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
