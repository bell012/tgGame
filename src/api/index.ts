/**
 * API 统一入口
 * 使用方式：import Api from '@/api'
 * 调用示例：
 *   - Api.auth.login(data)
 */

import * as auth from './modules/auth'

const Api = {
  auth // 登录、注册、短信验证码
}

export default Api
