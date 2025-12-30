import { defineStore } from 'pinia'

/**
 * 布局常量 Store
 */
export const useLayoutStore = defineStore('layout', () => {
  /** 侧边栏展开宽度 (px) */
  const SIDEBAR_WIDTH_EXPANDED = 240

  /** 侧边栏收起宽度 (px) */
  const SIDEBAR_WIDTH_COLLAPSED = 72

  /** 顶部导航栏高度 (px) */
  const TOPNAV_HEIGHT = 60

  /** 底部 Tab 栏高度 (px) */
  const BOTTOM_TAB_HEIGHT = 60

  /** H5/移动端 (px) */
  const MOBILE_BREAKPOINT = 640

  /** 侧边栏展开宽度  */
  const sidebarWidthExpandedClass = `w-[${SIDEBAR_WIDTH_EXPANDED}px]`

  /** 侧边栏收起宽度 */
  const sidebarWidthCollapsedClass = `w-[${SIDEBAR_WIDTH_COLLAPSED}px]`

  /** 主内容区左边距（展开） */
  const mainMarginLeftExpandedClass = `ml-[${SIDEBAR_WIDTH_EXPANDED}px]`

  /** 主内容区左边距（收起） */
  const mainMarginLeftCollapsedClass = `ml-[${SIDEBAR_WIDTH_COLLAPSED}px]`

  /** 顶部导航栏高度  */
  const topNavHeightClass = `h-[${TOPNAV_HEIGHT}px]`

  /** 主内容区顶部边距  */
  const mainMarginTopClass = `mt-[${TOPNAV_HEIGHT}px]`

  /** 底部 Tab 栏高度  */
  const bottomTabHeightClass = `h-[${BOTTOM_TAB_HEIGHT}px]`

  /** 主内容区底部边距 类名 */
  const mainMarginBottomClass = `mb-[${BOTTOM_TAB_HEIGHT}px]`

  // ========== H5/移动端 - CSS 媒体查询 ==========
  const mobileBreakpointMedia = `${MOBILE_BREAKPOINT}px`

  return {
    SIDEBAR_WIDTH_EXPANDED,
    SIDEBAR_WIDTH_COLLAPSED,
    TOPNAV_HEIGHT,
    BOTTOM_TAB_HEIGHT,
    MOBILE_BREAKPOINT,

    sidebarWidthExpandedClass,
    sidebarWidthCollapsedClass,
    mainMarginLeftExpandedClass,
    mainMarginLeftCollapsedClass,
    topNavHeightClass,
    mainMarginTopClass,
    bottomTabHeightClass,
    mainMarginBottomClass,

    mobileBreakpointMedia
  }
})

