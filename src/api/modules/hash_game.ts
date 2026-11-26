import request from '@/utils/request'
import type {
  HashGameApiResponse,
  HashGameBetPageParams,
  HashGameBetPageResult,
  HashGameCancelBetParams,
  HashGameCancelledBet,
  HashGameInfoParams,
  HashGameIssuePageParams,
  HashGameIssuePageResult,
  HashGameListParams,
  HashGameLotteryBetDetail,
  HashGameLotteryGame,
  HashGameLotteryInfo,
  HashGamePlaceBetParams,
  HashGamePlaceBetResult,
  HashGameRecentBetsParams,
  HashGameRecentBetsResult,
  HashGameRoadmapResult
} from '@/api/interface/hash_game.interface'

/** 查询当前货币可用的 Hash 彩票游戏列表。 */
export function getHashGameList(
  data: HashGameListParams
): Promise<HashGameApiResponse<HashGameLotteryGame[]>> {
  return request({
    url: `/chain-lottery/game/list`,
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 查询指定 Hash 彩票游戏的详情及赔率配置。 */
export function getHashGameInfo(
  data: HashGameInfoParams
): Promise<HashGameApiResponse<HashGameLotteryInfo>> {
  return request({
    url: `/chain-lottery/info`,
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 提交 Hash 彩票投注。 */
export function placeHashGameBet(
  data: HashGamePlaceBetParams
): Promise<HashGameApiResponse<HashGamePlaceBetResult>> {
  return request({
    url: `/chain-lottery/bet/place`,
    method: 'post',
    data,
    useSuccessFlag: true,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 按游戏和订单号取消投注。 */
export function cancelHashGameBet(
  data: HashGameCancelBetParams
): Promise<HashGameApiResponse<{ cancelled: HashGameCancelledBet[] }>> {
  return request({
    url: `/chain-lottery/bet/cancel`,
    method: 'post',
    data,
    useSuccessFlag: true,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 查询游戏走势/路单，默认获取最近 300 期。 */
export function getHashGameRoadmap(
  gameCode: string
): Promise<HashGameApiResponse<HashGameRoadmapResult>> {
  return request({
    url: `/chain-lottery/roadmap`,
    method: 'post',
    data: { gameCode, limit: 300 },
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 分页查询指定游戏的往期开奖。 */
export function getHashGameIssuePage(
  data: HashGameIssuePageParams
): Promise<HashGameApiResponse<HashGameIssuePageResult>> {
  return request({
    url: `/chain-lottery/issue/page`,
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 查询指定游戏或货币的近期投注记录。 */
export function getHashGameRecentBets(
  data: HashGameRecentBetsParams
): Promise<HashGameApiResponse<HashGameRecentBetsResult>> {
  return request({
    url: `/chain-lottery/bet/recent`,
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 分页查询投注记录。 */
export function getHashGameBetPage(
  data: HashGameBetPageParams,
  signal?: AbortSignal
): Promise<HashGameApiResponse<HashGameBetPageResult>> {
  return request({
    url: `/chain-lottery/bet/page`,
    method: 'post',
    data,
    signal,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 按订单号查询投注详情。 */
export function getHashGameBetDetail(
  orderNo: string
): Promise<HashGameApiResponse<HashGameLotteryBetDetail>> {
  return request({
    url: `/chain-lottery/bet/detail`,
    method: 'post',
    data: { orderNo },
    showSuccessToast: false,
    showErrorToast: false
  })
}
