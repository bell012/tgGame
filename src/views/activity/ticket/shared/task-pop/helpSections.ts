import type { TicketThresholdCondition } from '@/api/interface/activity'
import { PAY_CHANNEL_TAB_LIST } from '@/constants/payChannelTabs'
import type { HelpSection, TicketTaskTranslate } from './types'
import { TASK_I18N_PREFIX } from './types'
import { formatDisplayList, getAccumulationDescriptionPrefix } from './helpers'

export const createSimpleHelpSections = (title: string, content: string): HelpSection[] => [
  { title, content }
]

const formatPayChannelList = (methods: number[] | undefined, fallback: string) => {
  if (!methods?.length) return fallback

  return methods
    .map(method => {
      const methodKey = String(method)
      return PAY_CHANNEL_TAB_LIST.find(item => item.key === methodKey)?.value ?? methodKey
    })
    .join(', ')
}

export const createDepositAmountHelpSections = (
  condition: TicketThresholdCondition,
  rechargeMethods: number[] | undefined,
  t: TicketTaskTranslate,
  locale?: string
): HelpSection[] => [
  {
    title: t(`${TASK_I18N_PREFIX}.help.totalDepositAmount.title`),
    content: t(`${TASK_I18N_PREFIX}.help.totalDepositAmount.content`, {
      prefix: getAccumulationDescriptionPrefix(condition, t, locale)
    })
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validDepositAmount.title`),
    content: t(`${TASK_I18N_PREFIX}.help.validDepositAmount.content`)
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validDepositChannels.title`),
    content: formatPayChannelList(
      rechargeMethods,
      t(`${TASK_I18N_PREFIX}.help.validDepositChannels.fallback`)
    )
  }
]

export const createDepositCountHelpSections = (
  condition: TicketThresholdCondition,
  rechargeMethods: number[] | undefined,
  t: TicketTaskTranslate,
  locale?: string
): HelpSection[] => [
  {
    title: t(`${TASK_I18N_PREFIX}.help.totalDepositCount.title`),
    content: t(`${TASK_I18N_PREFIX}.help.totalDepositCount.content`, {
      prefix: getAccumulationDescriptionPrefix(condition, t, locale)
    })
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validDepositCount.title`),
    content: t(`${TASK_I18N_PREFIX}.help.validDepositCount.content`)
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validDepositChannels.title`),
    content: formatPayChannelList(
      rechargeMethods,
      t(`${TASK_I18N_PREFIX}.help.validDepositChannels.fallback`)
    )
  }
]

export const createTurnoverHelpSections = (
  condition: TicketThresholdCondition,
  t: TicketTaskTranslate,
  locale?: string,
  validPlatforms?: string[],
  platformGameCodes?: string[]
): HelpSection[] => [
  {
    title: t(`${TASK_I18N_PREFIX}.help.totalTurnover.title`),
    content: t(`${TASK_I18N_PREFIX}.help.totalTurnover.content`, {
      prefix: getAccumulationDescriptionPrefix(condition, t, locale)
    })
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validTurnover.title`),
    content: t(`${TASK_I18N_PREFIX}.help.validTurnover.content`)
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validTurnoverScope.title`),
    content: formatDisplayList(
      validPlatforms?.length ? validPlatforms : platformGameCodes,
      t(`${TASK_I18N_PREFIX}.help.validTurnoverScope.fallback`)
    )
  }
]

export const createGameLossHelpSections = (
  condition: TicketThresholdCondition,
  t: TicketTaskTranslate,
  locale?: string
): HelpSection[] =>
  createSimpleHelpSections(
    t(`${TASK_I18N_PREFIX}.help.lossAmount.title`),
    t(`${TASK_I18N_PREFIX}.help.lossAmount.content`, {
      prefix: getAccumulationDescriptionPrefix(condition, t, locale)
    })
  )
