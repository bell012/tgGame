/**
 * API 统一入口
 * 使用方式：import Api from '@/api'
 * 调用示例：
 *   - Api.auth.login(data)
 *   - Api.user.queryAcctInfo(data)
 *   - Api.home.getGameData()
 */

import * as auth from './modules/auth'
import * as home from './modules/home'
import * as notifications from './modules/notifications'
import * as picture from './modules/picture'
import * as user from './modules/user'
import * as vip from './modules/vip'
import * as wallet from './modules/wallet'

const Api = {
  notifications, // 模块
  auth, // 登录、注册、短信验证码
  picture, // 图片上传
  user, // 用户信息查询
  vip, // VIP 信息查询
  home, // 首页数据
  wallet // 钱包
}

export default Api
