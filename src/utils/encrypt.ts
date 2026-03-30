import CryptoJS from 'crypto-js'

/**
 * AES 加密解密工具类
 * 使用 ECB 模式，PKCS7 填充，Base64 编码
 */
export class AESUtils {
  /**
   * AES 加密 (ECB模式，PKCS7Padding，Base64编码)
   * @param plaintext 待加密的明文
   * @param key 加密密钥（16位）
   * @returns Base64编码的加密结果
   */
  static encryptAES(plaintext: string, key: string): string {
    try {
      const keyWordArray = CryptoJS.enc.Utf8.parse(key)
      // 加密
      const encrypted = CryptoJS.AES.encrypt(plaintext, keyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
      return encrypted.toString()
    } catch (e) {
      throw new Error(`加密失败: ${e}`)
    }
  }

  /**
   * AES 解密 (ECB模式，PKCS7Padding，Base64编码)
   * @param ciphertext Base64编码的密文
   * @param key 解密密钥(必须与加密时相同)
   * @returns 解密后的明文对象
   */
  static decryptAES(ciphertext: string, key: string): any {
    try {
      const keyWordArray = CryptoJS.enc.Utf8.parse(key)
      // 解密
      const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)
      try {
        const json = JSON.parse(decryptedStr)
        if (typeof json === 'string') {
          return JSON.parse(json)
        }
        return json
      } catch {
        return decryptedStr
      }
    } catch (e) {
      throw new Error(`解密失败: ${e}`)
    }
  }
}
