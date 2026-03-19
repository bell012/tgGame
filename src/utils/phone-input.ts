/**
 * 手机号输入相关工具函数
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
