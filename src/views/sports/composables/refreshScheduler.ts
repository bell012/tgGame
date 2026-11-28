type RefreshActions = {
  normal: () => Promise<unknown>
  hot: () => Promise<unknown>
  cancelNormal: () => void
  cancelHot: () => void
}

const ROUND_INTERVAL = 20_000

export const createSportsRefreshLine = (run: () => Promise<unknown>, cancel: () => void) => {
  let active = false
  let generation = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  const tick = async () => {
    if (!active) return
    const current = generation
    try {
      await run()
    } catch {
      // 本轮失败也要等任务结束，保留已有数据并在下一轮重试。
    } finally {
      if (active && current === generation) timer = setTimeout(tick, ROUND_INTERVAL)
    }
  }
  return {
    start(immediate = false) {
      if (active) return
      active = true
      timer = setTimeout(tick, immediate ? 0 : ROUND_INTERVAL)
    },
    stop() {
      active = false
      generation += 1
      clearTimeout(timer)
      cancel()
    }
  }
}

/** 普通与热门独立计时，互不阻塞。 */
export const createHomepageRefresh = (actions: RefreshActions) => {
  const normal = createSportsRefreshLine(actions.normal, actions.cancelNormal)
  const hot = createSportsRefreshLine(actions.hot, actions.cancelHot)
  return {
    startNormal: normal.start,
    stopNormal: normal.stop,
    startHot: hot.start,
    stopHot: hot.stop,
    stop() {
      normal.stop()
      hot.stop()
    }
  }
}
