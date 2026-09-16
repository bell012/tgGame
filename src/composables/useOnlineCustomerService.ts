import { readonly, ref } from 'vue'
import Api from '@/api'

const visible = ref(false)
const loading = ref(false)
const url = ref('')
const errorKey = ref('')
let requestVersion = 0

const load = async () => {
  if (loading.value || !visible.value) return
  const version = ++requestVersion
  loading.value = true
  url.value = ''
  errorKey.value = ''

  try {
    const response = await Api.onlineCustomer.queryOnLineByType()
    if (version !== requestVersion || !visible.value) return
    if (!response?.success) {
      errorKey.value = 'onlineCustomer.requestFailed'
      return
    }
    if (!response.result) {
      errorKey.value = 'onlineCustomer.unavailable'
      return
    }
    if (response.result.subType !== 2) {
      errorKey.value = 'onlineCustomer.unsupported'
      return
    }
    try {
      const address = new URL(response.result.url)
      if (!['http:', 'https:'].includes(address.protocol)) throw new Error('Invalid protocol')
      url.value = address.href
    } catch {
      errorKey.value = 'onlineCustomer.invalidUrl'
    }
  } catch {
    if (version === requestVersion && visible.value) {
      errorKey.value = 'onlineCustomer.requestFailed'
    }
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

const open = () => {
  if (visible.value) return
  visible.value = true
  void load()
}

const close = () => {
  visible.value = false
  requestVersion += 1
  loading.value = false
}

// Keep the iframe alive during the leave transition, without clearing a newly opened session.
const afterLeave = () => {
  if (visible.value) return
  url.value = ''
  errorKey.value = ''
}

export const useOnlineCustomerService = () => ({
  visible: readonly(visible),
  loading: readonly(loading),
  url: readonly(url),
  errorKey: readonly(errorKey),
  open,
  close,
  retry: load,
  afterLeave
})
