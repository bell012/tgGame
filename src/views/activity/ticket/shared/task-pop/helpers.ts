import { formatBalance, getCurrencySymbol } from '@/utils/locale'
import type { TicketTaskTranslate } from './types'
import { TASK_I18N_PREFIX } from './types'

export const getTicketTaskCompleteRequirementsRule = (t: TicketTaskTranslate) => ({
  prefix: t(`${TASK_I18N_PREFIX}.rules.items.completeRequirementsPrefix`),
  suffix: t(`${TASK_I18N_PREFIX}.rules.items.completeRequirementsSuffix`)
})

export const getTicketTaskRuleItems = (t: TicketTaskTranslate) => [
  t(`${TASK_I18N_PREFIX}.rules.items.cashCredited`),
  t(`${TASK_I18N_PREFIX}.rules.items.onceOnly`),
  t(`${TASK_I18N_PREFIX}.rules.items.irregularActivity`),
  t(`${TASK_I18N_PREFIX}.rules.items.finalInterpretation`)
]

export const isTargetMet = (current: number, target: number, operator = '>=') => {
  switch (operator) {
    case '>':
      return current > target
    case '<=':
      return current <= target
    case '=':
    case '==':
      return current === target
    default:
      return current >= target
  }
}

export const calcProgress = (current: number, target: number) => {
  if (target <= 0) return 0
  return Math.min(100, Math.floor((current / target) * 100))
}

export const formatThresholdAmount = (amount: number, currency?: string) => {
  const formatted = formatBalance(amount, 2)
  return `${getCurrencySymbol(currency)}${formatted}`
}

export const normalizeTimestamp = (value?: number) => {
  if (!value) return null
  return value < 1_000_000_000_000 ? value * 1000 : value
}

export const normalizeTaskLocale = (locale?: string) => (locale === 'zh' ? 'zh-CN' : 'en-US')

export const formatAccumulationStartDate = (value?: number, locale?: string) => {
  const timestamp = normalizeTimestamp(value)
  if (!timestamp) return ''

  return new Intl.DateTimeFormat(normalizeTaskLocale(locale), {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(timestamp))
}

export const getAccumulationDescriptionPrefix = (
  condition: { accumulateType?: number; startDate?: number },
  t: TicketTaskTranslate,
  locale?: string
) => {
  switch (condition.accumulateType) {
    case 2: {
      const formattedDate = formatAccumulationStartDate(condition.startDate, locale)
      return formattedDate
        ? t(`${TASK_I18N_PREFIX}.accumulation.startingFromDate`, { date: formattedDate })
        : t(`${TASK_I18N_PREFIX}.accumulation.startingFromSpecifiedDate`)
    }
    case 3:
      return t(`${TASK_I18N_PREFIX}.accumulation.afterAccountCreated`)
    default:
      return t(`${TASK_I18N_PREFIX}.accumulation.afterReceivingVoucher`)
  }
}

export const formatDisplayList = (values: Array<number | string> | undefined, fallback: string) => {
  if (!values?.length) return fallback
  return values.join(', ')
}
