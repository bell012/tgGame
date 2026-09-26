import { computed, onScopeDispose, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

type UnconfirmedState = 'pending' | 'unknown'
type Submission = { selectionIds: string[]; state: UnconfirmedState }
const STORAGE_PREFIX = 'sportsUnconfirmedBets:'

const parseSubmission = (raw: string): Submission => {
  const value: unknown = JSON.parse(raw)
  if (
    !value ||
    typeof value !== 'object' ||
    !('state' in value) ||
    (value.state !== 'pending' && value.state !== 'unknown') ||
    !('selectionIds' in value) ||
    !Array.isArray(value.selectionIds) ||
    !value.selectionIds.length ||
    !value.selectionIds.every((id: unknown) => typeof id === 'string' && id.length > 0)
  ) {
    throw new Error('Invalid bet submission cache')
  }
  return { selectionIds: value.selectionIds, state: value.state }
}

export const useBetSubmissionCache = (
  account: Readonly<Ref<string>>,
  open: Readonly<Ref<boolean>>,
  notifyUnconfirmed: () => void,
  notifyStorageError: () => void,
  notifyLockError: () => void
) => {
  const submissions = ref<Record<string, Submission>>({})
  const activeRequests = new Set<string>()
  const notified = new Set<string>()
  const reservationController = new AbortController()
  const prefix = () => (account.value ? `${STORAGE_PREFIX}${account.value}:` : '')

  const reload = () => {
    if (!account.value) {
      submissions.value = {}
      return true
    }
    try {
      const records: Record<string, Submission> = {}
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        if (!key?.startsWith(prefix())) continue
        const raw = localStorage.getItem(key)
        if (raw !== null) records[key] = parseSubmission(raw)
      }
      submissions.value = records
      return true
    } catch {
      // 不能读取记录时，不把它当作没有提交过。
      return false
    }
  }

  const selectionStates = computed(() => {
    const states: Record<string, UnconfirmedState> = {}
    for (const [key, record] of Object.entries(submissions.value)) {
      if (activeRequests.has(key)) continue
      for (const id of record.selectionIds) states[id] = record.state
    }
    return states
  })
  const showUnconfirmed = () => {
    for (const key of Object.keys(submissions.value)) {
      if (!activeRequests.has(key)) notified.add(key)
    }
    notifyUnconfirmed()
  }
  const includesSelection = (id: string) =>
    Object.values(submissions.value).some(record => record.selectionIds.includes(id))
  const canAdd = (id: string) => {
    if (!reload()) {
      notifyStorageError()
      return false
    }
    if (!includesSelection(id)) return true
    showUnconfirmed()
    return false
  }

  // 每个请求单独保存，单关并发返回时互不覆盖。
  const saveReservation = (groups: string[][]): string[] | null => {
    if (!account.value || !reload()) {
      notifyStorageError()
      return null
    }
    if (groups.some(ids => ids.some(includesSelection))) {
      showUnconfirmed()
      return null
    }
    const keys: string[] = []
    try {
      for (const selectionIds of groups) {
        const key = `${prefix()}${uuidv4()}`
        const record: Submission = { selectionIds, state: 'unknown' }
        localStorage.setItem(key, JSON.stringify(record))
        keys.push(key)
        activeRequests.add(key)
        submissions.value[key] = record
      }
      return keys
    } catch {
      // 尚未发出请求，撤销本次已写入的记录。
      for (const key of keys) {
        activeRequests.delete(key)
        try {
          localStorage.removeItem(key)
          delete submissions.value[key]
        } catch {
          // 删除失败时保留保护，不继续下单。
        }
      }
      notifyStorageError()
      return null
    }
  }

  const reserve = async (
    groups: string[][],
    isCurrent: () => boolean
  ): Promise<string[] | null> => {
    const requestedAccount = account.value
    if (!isCurrent() || !requestedAccount) return null
    if (typeof navigator === 'undefined' || !navigator.locks) {
      notifyLockError()
      return null
    }
    try {
      // 锁内重新查重，只锁住缓存操作，不等待下单接口。
      return await navigator.locks.request(
        `${STORAGE_PREFIX}${requestedAccount}`,
        { mode: 'exclusive', signal: reservationController.signal },
        () => {
          if (!isCurrent() || account.value !== requestedAccount) return null
          return saveReservation(groups)
        }
      )
    } catch {
      if (!reservationController.signal.aborted && isCurrent()) notifyLockError()
      return null
    }
  }

  const settle = (key: string, state?: UnconfirmedState) => {
    activeRequests.delete(key)
    notified.add(key)
    try {
      if (state) {
        const raw = localStorage.getItem(key)
        if (raw !== null) {
          const record = { ...parseSubmission(raw), state }
          localStorage.setItem(key, JSON.stringify(record))
          if (account.value && key.startsWith(prefix())) submissions.value[key] = record
        }
      } else {
        localStorage.removeItem(key)
        delete submissions.value[key]
      }
    } catch {
      // 已发出的请求不重试；缓存写入失败时保留原记录。
      if (account.value && key.startsWith(prefix())) notifyStorageError()
    }
    // activeRequests 不参与响应式，结束请求后主动更新派生状态。
    submissions.value = { ...submissions.value }
  }

  watch(
    [account, open],
    ([currentAccount, isOpen], previous) => {
      if (currentAccount !== previous?.[0]) submissions.value = {}
      if (!reload()) {
        if (isOpen) notifyStorageError()
        return
      }
      if (
        isOpen &&
        Object.keys(submissions.value).some(key => !activeRequests.has(key) && !notified.has(key))
      ) {
        showUnconfirmed()
      }
    },
    { immediate: true, flush: 'sync' }
  )
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || (account.value && event.key.startsWith(prefix()))) reload()
  }
  window.addEventListener('storage', onStorage)
  onScopeDispose(() => {
    reservationController.abort()
    window.removeEventListener('storage', onStorage)
  })

  return { selectionStates, canAdd, reserve, settle, showUnconfirmed }
}
