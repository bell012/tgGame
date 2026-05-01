import Api from '@/api'
import { navigateTo } from '@/utils/router'
import { computed, inject, type ComputedRef } from 'vue'

export type GameDetailForPlatformPlay = {
  rowId?: string | number
  itemCode?: string | number
  platformCode?: string
  pgType?: string
  itemName?: string
  platformName?: string
  icon2?: string
  conUrl?: string
  gameItemHotVo?: {
    defaultImage?: string
  }
} | null

/**
 * 游戏详情页「进入游戏」：调登录平台接口并跳转 platformLink（依赖 provide：game-detail-current-game）
 */
export function useGamePlatformPlay() {
  const currentGameDetail = inject<ComputedRef<GameDetailForPlatformPlay>>(
    'game-detail-current-game',
    computed(() => null)
  )

  const gamePlay = async () => {
    try {
      const res = await Api.game.getloginPlatform({
        pgType: currentGameDetail.value?.pgType,
        gameCode: currentGameDetail.value?.itemCode,
        platformCode: currentGameDetail.value?.platformCode
      })
      if (res.code === 'C2') {
        const raw = res.result?.platformLink
        const gameUrl = typeof raw === 'string' ? raw.trim() : ''
        const gameCode = String(currentGameDetail.value?.itemCode ?? '').trim()
        const companyCode = String(currentGameDetail.value?.platformCode ?? '').trim()
        const rowId = String(currentGameDetail.value?.rowId ?? '').trim()
        if (gameUrl) {
          await navigateTo('/game-iframe', {
            state: {
              gameLaunch: {
                url: gameUrl,
                gameCode,
                companyCode,
                rowId
              }
            }
          })
        }
      }
    } catch (error) {
      console.error('gamePlay failed', error)
    }
  }

  return {
    gamePlay,
    currentGameDetail
  }
}
