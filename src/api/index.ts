/**
 * API 统一入口
 * 使用方式：import Api from '@/api'
 * 调用示例：
 *   - Api.auth.login(data)
 *   - Api.user.queryAcctInfo(data)
 */

import * as auth from './modules/auth'
import * as agent from './modules/agent'
import * as game from './modules/game'
import * as home from './modules/home'
import * as notifications from './modules/notifications'
import * as picture from './modules/picture'
import * as record from './modules/record'
import * as withdraw from './modules/withdraw'
import * as user from './modules/user'
import * as vip from './modules/vip'
import * as wallet from './modules/wallet'
import * as activity from './modules/activity'
import * as rewardCenter from './modules/reward-center'
import * as task from './modules/task'

const Api = {
  agent, // 一级代理
  notifications, // 模块
  auth, // 登录、注册、短信验证码
  game, // 游戏数据
  picture, // 图片上传
  user, // 用户信息查询
  vip, // VIP 信息查询
  home, // 首页数据
  withdraw, // 提现
  wallet, // 钱包
  record, // 记录页数据 如：投注记录 资金明显 流水稽查
  activity, // 活动：签到、票券列表、票券活动弹窗（Lucky Spin 等）
  rewardCenter, // 奖励中心
  task // 任务：新人福利等
}

export default Api
