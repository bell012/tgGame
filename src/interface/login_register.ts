/**
 * 登录注册相关接口类型定义
 */

// 会员登录 /mc/loginMember
export interface LoginForm {
  memberId: string // 会员账号(账号还是手机都要传。手机是区号+号码)
  channelId: string // 注册终端  1:竖版  2:横版  3:PC 4:H5  5:其他
  requestMethod: string // 0:账号密码 1:手机号码 2:纸飞机 3:脸书 4:X公司 5:Line 6:谷歌 7:微信
  password?: string // 密码（账号密码登录时需要）
}

// 登录响应
export interface LoginResponse {
  token: string
  userInfo: {
    memberId: string
    nickname?: string
    avatar?: string
  }
}

// 会员注册 /mc/newMember
export interface RegisterForm {
  memberId: string // 会员账号(账号还是手机都要传。手机是区号+号码)
  channelId: string // 注册终端  1:竖版  2:横版  3:PC 4:H5  5:其他
  languageCode: string // 语言编码  zh中文  en英文
  requestMethod: number // 0:账号密码 1:手机号码
  currency: string // 币种
  smsCode: string // 短信验证码
  password?: string // 密码（账号密码注册时需要）
  areaCode?: string // 区号（手机号注册时需要）
}

// 注册响应
export interface RegisterResponse {
  token: string
  userInfo: {
    memberId: string
    nickname?: string
    avatar?: string
  }
}

// 发送短信验证码 /sy/sms
export interface SmsForm {
  telephone: string // 手机号码
  areaCode: string // 区号
}

// 发送短信响应
export interface SmsResponse {
  success: boolean
  message: string
}
