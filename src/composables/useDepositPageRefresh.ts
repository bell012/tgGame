import { readonly, ref } from 'vue'

const depositPageRefreshKey = ref(0)

/** 顶部币种选择后，通知充值页重新挂载 PC 充值内容。 */
export const useDepositPageRefresh = () => {
  const refreshDepositPage = () => {
    depositPageRefreshKey.value += 1
  }

  return {
    depositPageRefreshKey: readonly(depositPageRefreshKey),
    refreshDepositPage
  }
}
