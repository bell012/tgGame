import CryptoJS from 'crypto-js'

/**
 * 字符串扩展工具类
 */
export class StringExtension {
  /**
   * MD5 加密
   */
  static md5(str: string): string {
    return CryptoJS.MD5(str).toString()
  }

  /**
   * 从第22位开始截取，不足22位时取整个字符串，不足16位前面补'1'
   * 用于生成 AES 加密的 key
   */
  static tail16(str: string): string {
    let result: string

    // 判断是否够 22 位
    if (str.length >= 22) {
      result = str.substring(22)
    } else {
      result = str
    }

    // 补 '1' 到 16 位
    while (result.length < 16) {
      result = '1' + result
    }

    return result
  }

  /**
   * 字符串转整数
   */
  static toInt(str: string): number {
    return parseInt(str) || 0
  }

  /**
   * 字符串转浮点数
   */
  static toDouble(str: string): number {
    return parseFloat(str) || 0.0
  }

  /**
   * 字符串脱敏处理
   */
  static maskString(input: string, start = 4, end = 4): string {
    if (input.length <= start + end) return input // 长度太短就不处理
    const prefix = input.substring(0, start)
    const suffix = input.substring(input.length - end)
    const middle = '*'.repeat(input.length - start - end)
    return `${prefix}${middle}${suffix}`
  }

  /**
   * 屏蔽后4位
   */
  static maskLast4(str: string): string {
    if (str.length <= 4) return '****'
    return `${str.substring(0, str.length - 4)}****`
  }

  /**
   * 屏蔽前4位
   */
  static maskFirst4(str: string): string {
    if (str.length <= 4) return '****'
    return `****${str.substring(4)}`
  }

  /**
   * 屏蔽前面，只保留后3位
   */
  static maskLast3(str: string): string {
    if (str.length <= 3) return str
    return `*****${str.substring(str.length - 3)}`
  }

  /**
   * 是否是合法的绝对 URL
   */
  static isUrl(str: string): boolean {
    try {
      const url = new URL(str)
      return url.protocol !== '' && url.host !== ''
    } catch {
      return false
    }
  }

  /**
   * 是否是 WebView 可打开的 URL (支持 http / https)
   */
  static isWebUrl(str: string): boolean {
    try {
      const url = new URL(str)
      return (url.protocol === 'http:' || url.protocol === 'https:') && url.host !== ''
    } catch {
      return false
    }
  }

  /**
   * 宽松判断（支持 www.xxx.com）
   */
  static isUrlLoose(str: string): boolean {
    try {
      const urlStr = str.startsWith('http') ? str : `https://${str}`

      const url = new URL(urlStr)
      return url.host !== ''
    } catch {
      return false
    }
  }

  /**
   * 数字区间取随机整数
   */
  static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}
