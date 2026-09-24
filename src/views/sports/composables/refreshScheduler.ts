type RefreshActions = {
  visible: () => Promise<unknown>
  counts: () => Promise<unknown>
  background: () => Promise<unknown>
  cancel: () => void
}

const EVENT_INTERVAL = 10_000
const LIST_INTERVAL = 10_000

/** 各任务结束后再计时，名单分页不占用赛事刷新周期。 */
export const createHomepageRefresh = (actions: RefreshActions) => {
  let active = false
  let generation = 0
  let visiblePending: Promise<void> | undefined
  let countsPending: Promise<void> | undefined
  let backgroundRunning = false
  let visibleRequested = false
  let nextListRefresh = Date.now() + LIST_INTERVAL
  let eventTimer: ReturnType<typeof setTimeout> | undefined
  let listTimer: ReturnType<typeof setTimeout> | undefined
  let targetsTimer: ReturnType<typeof setTimeout> | undefined

  const scheduleVisible = (delay: number) => {
    clearTimeout(eventTimer)
    eventTimer = setTimeout(runVisible, delay)
  }

  const runVisible = () => {
    if (!active) return
    if (visiblePending) {
      visibleRequested = true
      return
    }
    clearTimeout(eventTimer)
    const current = generation
    visiblePending = (async () => {
      await Promise.resolve()
      try {
        if (!active || current !== generation) return
        await actions.visible()
      } catch {
        // 静默刷新失败，保留旧数据，下轮再试。
      } finally {
        visiblePending = undefined
        if (active && current === generation) {
          scheduleVisible(visibleRequested ? 100 : EVENT_INTERVAL)
          visibleRequested = false
        }
      }
    })()
  }

  const runBackground = async () => {
    if (!active || backgroundRunning) return
    backgroundRunning = true
    try {
      await actions.background()
    } catch {
      // 分页失败由下一轮重试，不清空已显示赛事。
    } finally {
      backgroundRunning = false
    }
  }

  const scheduleLists = () => {
    clearTimeout(listTimer)
    listTimer = setTimeout(runLists, Math.max(0, nextListRefresh - Date.now()))
  }

  const runLists = () => {
    if (!active || countsPending) return
    const current = generation
    countsPending = (async () => {
      await Promise.resolve()
      try {
        if (!active || current !== generation) return
        try {
          await actions.counts()
        } catch {
          // 数量失败不影响赛事和名单更新。
        }
        if (active && current === generation) {
          nextListRefresh = Date.now() + LIST_INTERVAL
          void runBackground()
        }
      } finally {
        countsPending = undefined
        if (active && current === generation) scheduleLists()
      }
    })()
  }

  const stop = () => {
    active = false
    generation += 1
    visibleRequested = false
    clearTimeout(eventTimer)
    clearTimeout(listTimer)
    clearTimeout(targetsTimer)
    actions.cancel()
  }

  const start = (immediate = false) => {
    if (active) return
    active = true
    const current = generation
    const resumeLists = () => {
      if (active && current === generation) scheduleLists()
    }
    const resumeVisible = () => {
      if (active && current === generation) scheduleVisible(immediate ? 0 : EVENT_INTERVAL)
    }
    // 旧请求结束后才恢复该类任务；先安排已到期的数量更新。
    if (countsPending) void countsPending.then(resumeLists)
    else resumeLists()
    if (visiblePending) void visiblePending.then(resumeVisible)
    else resumeVisible()
  }

  const targetsChanged = () => {
    clearTimeout(targetsTimer)
    if (active) targetsTimer = setTimeout(runVisible, 100)
  }

  return { start, stop, targetsChanged }
}
