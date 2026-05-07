import { navigateTo } from '@/utils/router'
import { NavigationFailureType, isNavigationFailure } from 'vue-router'

interface GameListForAppNode {
  gameTypeCode?: string
  platformCode?: string
  itemCode?: string
  rowId?: string | number
  subGame?: GameListForAppNode[]
  [key: string]: unknown
}

export interface ContentJumpSource {
  /** 跳转类型：0 不跳转、1 URL 跳转、2 内部页面跳转、3 游戏跳转 */
  jumpType?: unknown
  /** 子类型：
   * jumpType=1 时：0 不跳转、1 内部 URL、2 外部 URL
   * jumpType=2 时：0 不跳转、1 活动、2 充值栏目、3 分享转盘、4 充值页面、5 积分转盘、6 邀请好友、7 登录注册页
   */
  linkType?: unknown
  /** 跳转目标：URL、路由路径或游戏跳转 payload */
  linkUrl?: unknown
}

interface ContentJumpOptions {
  /** 真正跳转前执行的前置副作用 */
  beforeNavigate?: () => void
  /** 对完整 http/https 地址执行额外连通性校验 */
  verifyInternalHttpUrl?: (linkUrl: string) => Promise<boolean>
  /** 打开登录弹窗 */
  openLoginModal?: () => void
  /** 加载全局游戏列表 */
  loadGameData?: () => Promise<unknown>
}

/**
 * 将 jumpType 规整为数字。
 * 0：不跳转
 * 1：URL 跳转
 * 2：内部页面跳转
 * 3：游戏跳转
 */
export const getNormalizedJumpType = (value: unknown) => Number(value) || 0

/**
 * 将 linkType 规整为数字。
 * jumpType=1 时：
 * 0：不跳转
 * 1：内部 URL
 * 2：外部 URL
 *
 * jumpType=2 时：
 * 0：不跳转
 * 1：活动
 * 2：充值栏目
 * 3：分享转盘
 * 4：充值页面
 * 5：积分转盘
 * 6：邀请好友
 * 7：登录注册页
 */
export const getNormalizedLinkType = (value: unknown) => Number(value) || 0

/**
 * 将 linkUrl 规整为去除首尾空白的字符串。
 */
export const getNormalizedLinkUrl = (value: unknown) => String(value ?? '').trim()

/**
 * 判断链接是否为 http/https 绝对地址。
 */
export const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value)

/**
 * 判断链接是否为项目内部可识别的路由路径。
 */
export const isInternalRoutePath = (value: string) =>
  /^\/?[A-Za-z0-9/_-]+(?:\?[A-Za-z0-9\-._~%!$&'()*+,;=:@/?]*)?(?:#[^\s]*)?$/.test(value)

/**
 * 判断当前配置项是否具备可跳转能力。
 */
export const isConfiguredJumpItem = (item: ContentJumpSource) => {
  const jumpType = getNormalizedJumpType(item.jumpType)
  const linkType = getNormalizedLinkType(item.linkType)
  const linkUrl = getNormalizedLinkUrl(item.linkUrl)

  // jumpType=1：URL 跳转，要求带 linkUrl，且 linkType 必须是内部或外部 URL。
  if (jumpType === 1) {
    return (linkType === 1 || linkType === 2) && Boolean(linkUrl)
  }

  // jumpType=2：内部页面跳转，只要配置了 linkType 或 linkUrl 就认为可跳。
  if (jumpType === 2) {
    return linkType > 0 || Boolean(linkUrl)
  }

  // jumpType=3：游戏跳转，必须存在 payload。
  if (jumpType === 3) {
    return Boolean(linkUrl)
  }

  return false
}

/**
 * 将游戏跳转检索字段统一规整为字符串。
 */
const normalizeGameLookupValue = (value: unknown) => String(value ?? '').trim()

/**
 * 将逗号分隔的游戏检索字段拆分为数组。
 */
const splitGameLookupValues = (value: unknown) =>
  normalizeGameLookupValue(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

/**
 * 判断游戏检索字段是否命中目标值。
 */
const isGameLookupValueMatched = (sourceValue: unknown, targetValue: unknown) => {
  const normalizedTargetValue = normalizeGameLookupValue(targetValue)

  if (!normalizedTargetValue) {
    return false
  }

  return splitGameLookupValues(sourceValue).includes(normalizedTargetValue)
}

/**
 * 将嵌套游戏树拍平成列表，便于统一查找目标游戏。
 */
const flattenGameListForAppItems = (items: GameListForAppNode[]) => {
  const flattenedItems: GameListForAppNode[] = []

  const traverse = (item: GameListForAppNode) => {
    flattenedItems.push(item)

    const children = Array.isArray(item.subGame) ? item.subGame : []
    children.forEach(child => traverse(child))
  }

  items.forEach(traverse)

  return flattenedItems
}

/**
 * 执行真正跳转前的公共前置逻辑。
 */
const runBeforeNavigate = (options: ContentJumpOptions) => {
  options.beforeNavigate?.()
}

/**
 * 处理配置项中的“内部 URL”跳转。
 */
const openConfiguredInternalUrl = async (linkUrl: string, options: ContentJumpOptions) => {
  if (!linkUrl) {
    return false
  }

  // 完整 URL 仍按当前窗口打开，但允许外部调用方先做可达性校验。
  if (isAbsoluteHttpUrl(linkUrl)) {
    const canOpen = options.verifyInternalHttpUrl
      ? await options.verifyInternalHttpUrl(linkUrl)
      : true

    if (!canOpen) {
      return false
    }

    runBeforeNavigate(options)
    return Boolean(window.open(linkUrl, '_self'))
  }

  if (!isInternalRoutePath(linkUrl)) {
    return false
  }

  runBeforeNavigate(options)
  const navigationResult = await navigateTo(linkUrl)

  if (
    navigationResult &&
    (isNavigationFailure(navigationResult, NavigationFailureType.aborted) ||
      isNavigationFailure(navigationResult, NavigationFailureType.cancelled))
  ) {
    return false
  }

  return true
}

/**
 * 处理 jumpType=2 的内部页面跳转。
 */
const handleInternalPageJump = async (item: ContentJumpSource, options: ContentJumpOptions) => {
  const linkType = getNormalizedLinkType(item.linkType)
  const linkUrl = getNormalizedLinkUrl(item.linkUrl)

  // linkType=2/4：充值栏目或充值页面，统一跳转到充值页。
  if (linkType === 2 || linkType === 4) {
    runBeforeNavigate(options)
    await navigateTo('/deposit')
    return true
  }

  // 如果配置了内部 URL，则优先按 URL 规则处理。
  if (await openConfiguredInternalUrl(linkUrl, options)) {
    return true
  }

  // linkType=6：邀请好友页。
  if (linkType === 6) {
    runBeforeNavigate(options)
    await navigateTo('/referral')
    return true
  }

  // linkType=7：登录注册页。
  if (linkType === 7) {
    if (!options.openLoginModal) {
      return false
    }

    options.openLoginModal()
    return true
  }

  return false
}

/**
 * 处理 jumpType=3 的游戏跳转。
 */
const handleGameJump = async (item: ContentJumpSource, options: ContentJumpOptions) => {
  const [pgType, platformCode, gameCode] = getNormalizedLinkUrl(item.linkUrl)
    .split('|')
    .map(value => value.trim())

  // 仅配置了 pgType 时，直接进入对应的娱乐城分类页。
  if (pgType && !platformCode && !gameCode) {
    await navigateTo(`/casino/${pgType}`)
    return true
  }

  if (!pgType || !platformCode || !gameCode) {
    return false
  }

  try {
    if (!options.loadGameData) {
      return false
    }

    const gameList = (await options.loadGameData()) as GameListForAppNode[]
    const matchedGame = flattenGameListForAppItems(gameList).find(game => {
      return (
        isGameLookupValueMatched(game.gameTypeCode, pgType) &&
        isGameLookupValueMatched(game.platformCode, platformCode) &&
        isGameLookupValueMatched(game.itemCode, gameCode)
      )
    })

    const targetRowId = normalizeGameLookupValue(matchedGame?.rowId)
    if (!targetRowId) {
      return false
    }

    await navigateTo(`/game/${targetRowId}`)
    return true
  } catch (error) {
    console.error('executeConfiguredJump game jump failed', error)
    return false
  }
}

/**
 * 按统一协议执行内容跳转。
 */
export const executeConfiguredJump = async (
  item: ContentJumpSource,
  options: ContentJumpOptions = {}
) => {
  const jumpType = getNormalizedJumpType(item.jumpType)
  const linkType = getNormalizedLinkType(item.linkType)
  const linkUrl = getNormalizedLinkUrl(item.linkUrl)

  // jumpType=1：URL 跳转。linkType=1 为内部 URL，linkType=2 为外部 URL。
  if (jumpType === 1) {
    if (linkType === 2 && isAbsoluteHttpUrl(linkUrl)) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer')
      return true
    }

    if (linkType === 1 && (await openConfiguredInternalUrl(linkUrl, options))) {
      return true
    }

    return false
  }

  // jumpType=2：内部页面跳转。
  if (jumpType === 2) {
    return handleInternalPageJump(item, options)
  }

  // jumpType=3：游戏跳转。
  if (jumpType === 3) {
    if (!getNormalizedLinkUrl(item.linkUrl)) {
      return false
    }

    runBeforeNavigate(options)
    return handleGameJump(item, options)
  }

  return false
}
