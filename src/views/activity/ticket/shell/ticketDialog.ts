import { reactive } from 'vue'
import type {
  TicketReminderTask,
  TicketResultVariant,
  TicketVoucherCardData
} from '../shared/types'

export type TicketDialogKind = 'none' | 'reminder' | 'task_success' | 'result'

export interface OpenTicketReminderDialogOptions {
  tasks?: TicketReminderTask[]
  rules?: string[]
  voucherName?: string
  maxPrizeText?: string
}

export interface OpenTicketTaskSuccessDialogOptions {
  voucherName: string
  rules?: string[]
}

export type TicketResultHeroLottie = 'mystery_box_open'

export interface OpenTicketResultDialogOptions {
  variant: TicketResultVariant
  highlightText?: string
  vouchers?: TicketVoucherCardData[]
  voucherCount?: number
  title?: string
  subtext?: string
  heroImage?: string
  heroLottie?: TicketResultHeroLottie
  buttonText?: string
}

export interface TicketResultDialogState {
  variant: TicketResultVariant
  highlightText: string
  vouchers: TicketVoucherCardData[]
  voucherCount: number
  title?: string
  subtext?: string
  heroImage?: string
  heroLottie?: TicketResultHeroLottie
  buttonText?: string
}

interface GlobalTicketDialogState {
  kind: TicketDialogKind
  reminder: {
    tasks: TicketReminderTask[]
    rules: string[]
    voucherName: string
    maxPrizeText: string
  }
  taskSuccess: {
    voucherName: string
    rules: string[]
  }
  result: TicketResultDialogState
}

const createDefaultResult = (): TicketResultDialogState => ({
  variant: 'cash',
  highlightText: '',
  vouchers: [],
  voucherCount: 0
})

export const globalTicketDialogState = reactive<GlobalTicketDialogState>({
  kind: 'none',
  reminder: { tasks: [], rules: [], voucherName: '', maxPrizeText: '' },
  taskSuccess: { voucherName: '', rules: [] },
  result: createDefaultResult()
})

export function openTicketReminderDialog(options: OpenTicketReminderDialogOptions = {}) {
  globalTicketDialogState.reminder.tasks = options.tasks ?? []
  globalTicketDialogState.reminder.rules = options.rules ?? []
  globalTicketDialogState.reminder.voucherName = options.voucherName ?? ''
  globalTicketDialogState.reminder.maxPrizeText = options.maxPrizeText ?? ''
  globalTicketDialogState.kind = 'reminder'
}

export function openTicketTaskSuccessDialog(options: OpenTicketTaskSuccessDialogOptions) {
  globalTicketDialogState.taskSuccess.voucherName = options.voucherName
  globalTicketDialogState.taskSuccess.rules = options.rules ?? []
  globalTicketDialogState.kind = 'task_success'
}

export function openTicketResultDialog(options: OpenTicketResultDialogOptions) {
  const vouchers = options.vouchers ?? []
  globalTicketDialogState.result = {
    ...createDefaultResult(),
    ...options,
    vouchers,
    voucherCount: options.voucherCount ?? vouchers.length
  }
  globalTicketDialogState.kind = 'result'
}

export function closeTicketDialog() {
  globalTicketDialogState.kind = 'none'
  globalTicketDialogState.reminder = { tasks: [], rules: [], voucherName: '', maxPrizeText: '' }
  globalTicketDialogState.taskSuccess = { voucherName: '', rules: [] }
  globalTicketDialogState.result = createDefaultResult()
}
