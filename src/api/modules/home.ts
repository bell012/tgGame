import request, { type ApiResponseToastOptions } from '@/utils/request'
import type {
  GameDataResponse,
  GetRecentBigWinsParams,
  QuerySlideshowRequest,
  QuerySlideshowResponse,
  RecentBigWinsResponse
} from '@/api/interface/home.interface'

/**
 * 获取首页数据
 * @returns Promise<any>
 */
export function getGameData(options?: ApiResponseToastOptions): Promise<GameDataResponse> {
  return request({
    url: '/gc/queryGameListForApp',
    method: 'post',
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

// 查询活动栏目
export function getActivityType(): Promise<any> {
  return request({
    url: '/ac/queryGameListForApp',
    method: 'post',
    showSuccessToast: false,
    showErrorToast: true
  })
}
// 近期大奖
export function getRecentBigWins(
  data: GetRecentBigWinsParams,
  options?: ApiResponseToastOptions
): Promise<RecentBigWinsResponse> {
  return request({
    url: '/special/getRecentBigWins',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  })
}

// 近期大奖
export function getQuerySlideshow(data: QuerySlideshowRequest): Promise<QuerySlideshowResponse> {
  return request({
    url: '/ac/querySlideshow',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: false
  })
}

// 供应商 /gc/gameBrandList
export function getGameBrandList(options?: ApiResponseToastOptions): Promise<any> {
  return request({
    url: '/gc/gameBrandList',
    method: 'post',
    showSuccessToast: options?.showSuccessToast ?? false,
    showErrorToast: options?.showErrorToast ?? true
  })
}

// 站点配置
export function dlicgh(data: any): Promise<any> {
  return request({
    url: '/sy/dlicgh',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}


export function getLatestList(data: any): Promise<any> {
  return request({
    url: '/special/getLatestList',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}
