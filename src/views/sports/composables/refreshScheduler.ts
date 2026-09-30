type RefreshActions = {
  visible: () => Promise<unknown>
  counts: () => Promise<unknown>
  background: () => Promise<unknown>
  hot: () => Promise<unknown>
  cancel: () => void
}

type ListTask = 'counts' | 'background' | 'hot'

const EVENT_INTERVAL = 10_000
const LIST_INTERVAL = 10_000

/** 数量、名单和可见赛事独立刷新，同类请求不重叠。 */
export const createHomepageRefresh = (actions: RefreshActions) => {
  let active = false
  let generation = 0
  let visibleRunning = false
  const runningLists = new Set<ListTask>()
  let visibleRequested = false
  let nextListRefresh = Date.now() + LIST_INTERVAL
  let eventTimer: ReturnType<typeof setTimeout> | undefined
  let listTimer: ReturnType<typeof setTimeout> | undefined
  let targetsTimer: ReturnType<typeof setTimeout> | undefined

  const scheduleVisible = (delay: number) => {
    clearTimeout(eventTimer)
    eventTimer = setTimeout(runVisible, delay)
  }

  const runVisible = async () => {
    if (!active) return
    if (visibleRunning) {
      visibleRequested = true
      return
    }
    clearTimeout(eventTimer)
    const current = generation
    visibleRunning = true
    try {
      await actions.visible()
    } catch {
      // 静默刷新失败，保留旧数据，下轮再试。
    } finally {
      if (active && current === generation) {
        visibleRunning = false
        scheduleVisible(visibleRequested ? 100 : EVENT_INTERVAL)
        visibleRequested = false
      }
    }
  }

  const runListTask = async (task: ListTask) => {
    if (!active || runningLists.has(task)) return
    const current = generation
    runningLists.add(task)
    try {
      await actions[task]()
    } catch {
      // 各自重试，不清空旧数据，也不阻塞其他任务。
    } finally {
      if (current === generation) runningLists.delete(task)
    }
  }

  const scheduleLists = () => {
    clearTimeout(listTimer)
    listTimer = setTimeout(runLists, Math.max(0, nextListRefresh - Date.now()))
  }

  const runLists = () => {
    if (!active) return
    // 数量先发出，名单不等待数量响应。
    void runListTask('counts')
    void runListTask('background')
    void runListTask('hot')
    nextListRefresh = Date.now() + LIST_INTERVAL
    scheduleLists()
  }

  const stop = () => {
    active = false
    generation += 1
    visibleRunning = false
    runningLists.clear()
    visibleRequested = false
    clearTimeout(eventTimer)
    clearTimeout(listTimer)
    clearTimeout(targetsTimer)
    actions.cancel()
  }

  const start = (immediate = false) => {
    if (active) return
    active = true
    scheduleLists()
    scheduleVisible(immediate ? 0 : EVENT_INTERVAL)
  }

  const targetsChanged = () => {
    clearTimeout(targetsTimer)
    if (active) targetsTimer = setTimeout(runVisible, 100)
  }

  return { start, stop, targetsChanged }
}
