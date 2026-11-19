/** 哈希游戏聊天配置；解锁规则只保留接口原始值。 */
export type HashChatConfig = {
  gameCode: string
  betBroadcastMode: string
  lengthLimit: number
  phrases: string[]
  unlockAmount: number
  unlockMode: string
  unlocked: boolean
  welcomeText: string
}
