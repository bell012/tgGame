/**
 * 登录注册相关接口类型定义
 */

// 登陆注册设置响应 /ad/getLoginAndRegisterSetting
export interface LoginSetResult {
  registerEnable: number // 是否容许注册  0:关闭 1:开启
  memberName: {
    // 会员真实姓名
    enable: boolean
    required: boolean
  }
  phone: {
    // 手机号码
    enable: boolean
    required: boolean
  }
  invitationCode: {
    // 邀请码
    enable: boolean
    required: boolean
  }
  registerAuthType: [number] // 注册验证方式 0不验证 1:蓝盾验证码,2:网易验证码 3:短信
  loginAuthType: [number] // 登录验证方式 0不验证 1:蓝盾验证码,2:网易验证码 3:短信
  registerMethod: [number] // 注册方式1账号密码 2手机号码
  loginMethod: [number] // 登陆方式1账号密码 2手机号码
  sysAuthType: number // 系统验证方式 0不验证 1:蓝盾验证码,2:网易验证码 3:短信
}

// 登陆注册设置响应
export interface LoginSetResponse {
  code: string
  message: string
  result: LoginSetResult
  success: boolean
}

// 会员登录 /mc/loginMember
export interface LoginForm {
  memberId: string // 会员账号(账号还是手机都要传。手机是区号+号码)
  channelId: string // 注册终端  1:竖版  2:横版  3:PC 4:H5  5:其他
  requestMethod: string // 0:账号密码 1:手机号码 2:纸飞机 3:脸书 4:X公司 5:Line 6:谷歌 7:微信
  password?: string // 密码（账号密码登录时需要）
}

// 登录响应
export interface LoginResponse {
  code: string
  message: string
  success: boolean
}

// 会员注册 /mc/newMember
export interface RegisterForm {
  memberId: string // 会员账号(账号还是手机都要传。手机是区号+号码)
  channelId: string // 注册终端  1:竖版  2:横版  3:PC 4:H5  5:其他
  languageCode: string // 语言编码  zh中文  en英文
  requestMethod: number // 0:账号密码 1:手机号码
  currency: string // 币种
  smsCode: string // 短信验证码
  memberPwd?: string // 会员密码,手机注册时可以不传
  areaCode: string // 区号（手机号注册时需要）
  telephone: string // 手机号码 手机注册时也要传值
}

// 注册响应
export interface RegisterResponse {
  code: string
  message: string
  success: boolean
}

// 发送短信验证码 /sy/sms
export interface SmsForm {
  telephone: string // 手机号码
  areaCode: string // 区号
}

// 发送短信响应
export interface SmsResponse {
  code: string
  message: string
  success: boolean
}

// 发送短信验证码 /sy/sms
export interface ResetPasswordForm {
  memberPwd: string //新密码
  smsCode: string //短信验证码
  telephone: string //手机号
  areaCode: string //区号
  memberId: string // 会员账号(账号还是手机都要传。手机是区号+号码)
}

// 发送短信响应
export interface ResetPasswordResponse {
  code: string
  message: string
  success: boolean
}
