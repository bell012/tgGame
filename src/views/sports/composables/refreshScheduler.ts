type RefreshActions = {
  normal: () => Promise<unknown>
  hot: () => Promise<unknown>
  cancelNormal: () => void
  cancelHot: () => void
}

const ROUND_INTERVAL = 20_000

/** 两条更新线独立计时；请求及数据合并结束后才开始下一轮倒计时。 */
export const createHomepageRefresh = (actions: RefreshActions) => {
  const createLine = (run: () => Promise<unknown>, cancel: () => void) => {
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
  const normal = createLine(actions.normal, actions.cancelNormal)
  const hot = createLine(actions.hot, actions.cancelHot)
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
