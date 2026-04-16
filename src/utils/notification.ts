import { formatDisplayTime } from './date'

/**
 * 通知时间格式化兼容层，后续统一使用全局时间展示工具。
 */
export const formatNotificationTime = (timestamp?: number) => formatDisplayTime(timestamp)
