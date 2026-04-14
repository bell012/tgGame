import request from '@/utils/request'
import type {
  GameDataResponse,
  QuerySlideshowRequest,
  QuerySlideshowResponse
} from '@/api/interface/home.interface'

/**
 * 获取首页数据
 * @returns Promise<any>
 */
export function getGameData(): Promise<GameDataResponse> {
  return request({
    url: '/gc/queryGameListForApp',
    method: 'post',
    showSuccessToast: true,
    showErrorToast: true
  })
}

// 查询活动栏目
export function getActivityType(): Promise<any> {
  return request({
    url: '/ac/queryGameListForApp',
    method: 'post',
    showSuccessToast: true,
    showErrorToast: true
  })
}
// 近期大奖
export function getRecentBigWins(data: any): Promise<any> {
  return request({
    url: '/special/getRecentBigWins',
    method: 'post',
    data,
    showSuccessToast: true,
    showErrorToast: true
  })
}

// 近期大奖
export function getQuerySlideshow(data: QuerySlideshowRequest): Promise<QuerySlideshowResponse> {
  return request({
    url: '/ac/querySlideshow',
    method: 'post',
    data,
    showSuccessToast: true,
    showErrorToast: true
  })
}

// 供应商 /gc/gameBrandList
export function getGameBrandList(): Promise<any> {
  return request({
    url: '/gc/gameBrandList',
    method: 'post',
    showSuccessToast: true,
    showErrorToast: true
  })
}

// 站点配置
export function dlicgh(data: any): Promise<any> {
  return request({
    url: '/sy/dlicgh',
    method: 'post',
    data,
    showSuccessToast: true,
    showErrorToast: true
  })
}
