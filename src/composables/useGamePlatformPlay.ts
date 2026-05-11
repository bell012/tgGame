import Api from '@/api'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { savePlayedGameDetail } from '@/utils/played-games-cache'
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
  [key: string]: unknown
} | null

/**
 * 游戏详情页「进入游戏」：调登录平台接口并跳转 platformLink（依赖 provide：game-detail-current-game）
 */
export function useGamePlatformPlay() {
  const { currentCurrencyCode } = useDisplayCurrency()
  const currentGameDetail = inject<ComputedRef<GameDetailForPlatformPlay>>(
    'game-detail-current-game',
    computed(() => null)
  )

  const gamePlay = async () => {
    try {
      // 首次进入时先同步服务端钱包币种，避免游戏内币种/国旗与页面选择不一致。
      await Api.user.changeWallet({
        currency: currentCurrencyCode.value
      })

      const res = await Api.game.getloginPlatform({
        pgType: currentGameDetail.value?.pgType,
        gameCode: currentGameDetail.value?.itemCode,
        platformCode: currentGameDetail.value?.platformCode,
        currency: currentCurrencyCode.value
      })
      if (res.code === 'C2') {
        const raw = res.result?.platformLink
        const gameUrl = typeof raw === 'string' ? raw.trim() : ''
        const gameCode = String(currentGameDetail.value?.itemCode ?? '').trim()
        const companyCode = String(currentGameDetail.value?.platformCode ?? '').trim()
        const rowId = String(currentGameDetail.value?.rowId ?? '').trim()
        if (gameUrl) {
          try {
            savePlayedGameDetail(currentGameDetail.value)
          } catch (error) {
            console.error('save played game detail failed', error)
          }

          await navigateTo('/game-iframe', {
            state: {
              gameLaunch: {
                url: gameUrl,
                isHorizontal: res.result?.isHorizontal,
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
