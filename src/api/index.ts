/**
 * API 统一入口
 * 使用方式：import Api from '@/api'
 * 调用示例：
 *   - Api.auth.login(data)
 *   - Api.user.queryAcctInfo(data)
 *   - Api.home.getGameData()
 */

import * as auth from './modules/auth'
import * as user from './modules/user'
import * as home from './modules/home'

const Api = {
  auth, // 登录、注册、短信验证码
  user, // 用户信息查询
  home // 首页数据
}

export default Api
