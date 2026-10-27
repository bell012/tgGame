import type {
  CreditLoanAccount,
  CreditLoanApiResponse,
  CreditLoanBorrowResult,
  CreditLoanConfig,
  CreditLoanHistoryPage,
  CreditLoanHistoryQuery,
  CreditLoanHistoryRecord,
  CreditLoanInfo,
  CreditLoanJbHistoryQuery,
  CreditLoanPage,
  CreditLoanPageParams
} from '@/api/interface/credit-loan'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import request, { type ApiResponseToastOptions } from '@/utils/request'

/** 校验借呗业务响应成功后，统一返回其中的 result 数据。 */
const resolveCreditLoanApiResult = async <T>(
  requestPromise: Promise<CreditLoanApiResponse<T>>
): Promise<T> => {
  const response = await requestPromise

  return ensureApiBusinessSuccess(response).result
}

const postCreditLoan = <T>(url: string, data: unknown = {}, options?: ApiResponseToastOptions) =>
  resolveCreditLoanApiResult<T>(
    request({
      url,
      method: 'post',
      data,
      showSuccessToast: options?.showSuccessToast ?? false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

const buildPage = ({ current, size }: CreditLoanPageParams) => ({
  records: [],
  total: 0,
  size,
  current
})

/** 会员查询借呗余额。 */
export const queryBorAcc = (options?: ApiResponseToastOptions): Promise<CreditLoanAccount> =>
  postCreditLoan('/br/queryBorAcc', {}, options)

/** 会员查询额度信息（余额、可借额度、可转出余额、配置、借款状态、下次重置时间）。 */
export const queryBorInfo = (options?: ApiResponseToastOptions): Promise<CreditLoanInfo> =>
  postCreditLoan('/br/queryBorInfo', {}, options)

/** 借呗余额转出到钱包，返回转出金额。 */
export const transferWallet = (options?: ApiResponseToastOptions): Promise<number> =>
  postCreditLoan('/br/transferWallet', {}, options)

/** 会员借款。 */
export const loanAmount = (options?: ApiResponseToastOptions): Promise<CreditLoanBorrowResult> =>
  postCreditLoan('/br/loanAmount', {}, options)

/** 查询借呗配置。 */
export const getBorrowConfig = (options?: ApiResponseToastOptions): Promise<CreditLoanConfig> =>
  postCreditLoan('/br/getBorrowConfig', {}, options)

/** 分页查询借呗账变记录（按变更类型列表筛选）。 */
export const borrHisPage = (
  page: CreditLoanPageParams,
  query: CreditLoanHistoryQuery = {},
  options?: ApiResponseToastOptions
): Promise<CreditLoanHistoryPage> =>
  postCreditLoan(
    '/br/borrHisPage',
    {
      changeTypes: query.changeTypes ?? [],
      param: query.param ?? {},
      page: buildPage(page)
    },
    options
  )

/** 分页查询借呗账变记录（按会员名称、单个变更类型筛选）。 */
export const borrHisJbPage = (
  page: CreditLoanPageParams,
  param: CreditLoanJbHistoryQuery = {},
  options?: ApiResponseToastOptions
): Promise<CreditLoanPage<CreditLoanHistoryRecord>> =>
  postCreditLoan(
    '/br/borrHisJbPage',
    {
      param,
      page: buildPage(page)
    },
    options
  )
