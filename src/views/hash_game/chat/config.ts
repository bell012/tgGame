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

/** 当前阶段使用的聊天配置模拟响应。 */
export function createMockChatConfig(gameCode: string): HashChatConfig {
  return {
    gameCode,
    betBroadcastMode: 'MERGED',
    lengthLimit: 100,
    phrases: [
      '这把长龙很猛！',
      '手气来了挡也挡不住！',
      '这把稳了！',
      '各位老板，发财啊！',
      '大胆冲，好运来！',
      '财源滚滚来！',
      '手气来了挡也挡不住！',
      '这把稳了！',
      '各位老板，发财啊！',
      '大胆冲，好运来！',
      '财源滚滚来！',
      '手气来了挡也挡不住！',
      '这把稳了！',
      '各位老板，发财啊！',
      '大胆冲，好运来！',
      '财源滚滚来！',
      '手气来了挡也挡不住！',
      '这把稳了！',
      '各位老板，发财啊！',
      '大胆冲，好运来！',
      '财源滚滚来！'
    ],
    unlockAmount: 500,
    unlockMode: 'amount',
    unlocked: true,
    welcomeText:
      '欢迎进入游戏房间，祝您游戏愉快！本游戏开奖结果取自波场（TRON）区块链公开区块哈希，每期结果由链上数据唯一决定，平台无法干预、无法篡改，所有开奖记录均可在区块浏览器核验，公开透明、公平公正。严禁利用漏洞或不正当手段获利，请理性游戏、量力而行。'
  }
}
