import type {
  AddMemberCardForm,
  AddMemberCardResponse,
  DelMemberCardForm,
  DelMemberCardResponse,
  ModifyDefaultCardForm,
  ModifyDefaultCardResponse,
  QueryFastAmountForm,
  QueryFastAmountResponse,
  QueryNeedBetAmountForAppResponse,
  QueryTheWithdrawOrderForm,
  QueryTheWithdrawOrderResponse,
  QueryWithdrawConfigByMemberForm,
  QueryWithdrawConfigByMemberResponse,
  QueryWithdrawManagerForm,
  QueryWithdrawManagerResponse,
  QueryWithdrawOrderListForm,
  QueryWithdrawOrderListResponse,
  SelectMemberCardForm,
  SelectMemberCardResponse,
  SubmitTransferOrderForm,
  SubmitTransferOrderResponse
} from '@/api/interface/withdraw'
import request from '@/utils/request'

/**
 * 查询提现方式和基础配置
 * @param data 查询条件
 * @returns Promise<QueryWithdrawManagerResponse>
 */
export function queryWithdrawManager(
  data: QueryWithdrawManagerForm = {}
): Promise<QueryWithdrawManagerResponse> {
  return request({
    url: '/with/queryWithdrawManager',
    method: 'post',
    data
  })
}

/**
 * 查询会员收款账号
 * @param data 账号筛选条件
 * @returns Promise<SelectMemberCardResponse>
 */
export function selectMemberCard(data?: SelectMemberCardForm): Promise<SelectMemberCardResponse> {
  return request({
    url: '/mc/selectMemberCard',
    method: 'post',
    data
  })
}

/**
 * 新增会员收款账号
 * @param data 新增账号参数
 * @returns Promise<AddMemberCardResponse>
 */
export function addMemberCard(data: AddMemberCardForm): Promise<AddMemberCardResponse> {
  return request({
    url: '/mc/addMemberCard',
    method: 'post',
    data
  })
}

/**
 * 修改默认收款账号状态
 * @param data 修改参数
 * @returns Promise<ModifyDefaultCardResponse>
 */
export function modifyDefaultCard(data: ModifyDefaultCardForm): Promise<ModifyDefaultCardResponse> {
  return request({
    url: '/mc/modifyDefaultCard',
    method: 'post',
    data
  })
}

/**
 * 删除收款账号
 * @param data 删除参数
 * @returns Promise<DelMemberCardResponse>
 */
export function delMemberCard(data: DelMemberCardForm): Promise<DelMemberCardResponse> {
  return request({
    url: '/mc/delMemberCard',
    method: 'post',
    data
  })
}

/**
 * 查询快捷提现金额
 * @param params paymentCode
 * @returns Promise<QueryFastAmountResponse>
 */
export function queryFastAmount(params: QueryFastAmountForm): Promise<QueryFastAmountResponse> {
  return request({
    url: '/qa/getBonusLimitList',
    method: 'get',
    params
  })
}

/**
 * 查询当前会员仍需完成的流水金额
 * @returns Promise<QueryNeedBetAmountForAppResponse>
 */
export function queryNeedBetAmountForApp(): Promise<QueryNeedBetAmountForAppResponse> {
  return request({
    url: '/inspect/queryNeedBetAmountForApp',
    method: 'get'
  })
}

/**
 * 查询会员提现风控/强制出款配置
 * @param data accountNo
 * @returns Promise<QueryWithdrawConfigByMemberResponse>
 */
export function queryWithdrawConfigByMember(
  data: QueryWithdrawConfigByMemberForm
): Promise<QueryWithdrawConfigByMemberResponse> {
  return request({
    url: '/wc/queryWithdrawConfigByMember',
    method: 'post',
    data
  })
}

/**
 * 提交提现订单
 * @param data 提现参数
 * @returns Promise<SubmitTransferOrderResponse>
 */
export function submitTransferOrder(
  data: SubmitTransferOrderForm
): Promise<SubmitTransferOrderResponse> {
  return request({
    url: '/tc/submitTransferOrder',
    method: 'post',
    data
  })
}

/**
 * 查询提现订单列表
 * @param data 查询条件
 * @returns Promise<QueryWithdrawOrderListResponse>
 */
export function queryWithdrawOrderList(
  data: QueryWithdrawOrderListForm = {}
): Promise<QueryWithdrawOrderListResponse> {
  return request({
    url: '/bosu/queryNewWithdrawOrderList',
    method: 'post',
    data
  })
}

/**
 * 查询单个提现订单详情
 * @param data orderId
 * @returns Promise<QueryTheWithdrawOrderResponse>
 */
export function queryTheWithdrawOrder(
  data: QueryTheWithdrawOrderForm
): Promise<QueryTheWithdrawOrderResponse> {
  return request({
    url: '/bosu/queryTheWithdrawOrder',
    method: 'post',
    data
  })
}
