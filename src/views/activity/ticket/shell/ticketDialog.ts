import { reactive } from 'vue'
import type {
  LuckySpinResultVariant,
  LuckySpinTask,
  LuckySpinVoucherCardData
} from '../shared/types'

export type TicketDialogKind = 'none' | 'reminder' | 'task_success' | 'result'

export interface OpenTicketReminderDialogOptions {
  tasks?: LuckySpinTask[]
  rules?: string[]
}

export interface OpenTicketTaskSuccessDialogOptions {
  voucherName: string
  rules?: string[]
}

export interface OpenTicketResultDialogOptions {
  variant: LuckySpinResultVariant
  highlightText?: string
  vouchers?: LuckySpinVoucherCardData[]
  voucherCount?: number
  title?: string
  subtext?: string
  heroImage?: string
  buttonText?: string
}

interface TicketResultDialogState {
  variant: LuckySpinResultVariant
  highlightText: string
  vouchers: LuckySpinVoucherCardData[]
  voucherCount: number
  title?: string
  subtext?: string
  heroImage?: string
  buttonText?: string
}

interface GlobalTicketDialogState {
  kind: TicketDialogKind
  reminder: {
    tasks: LuckySpinTask[]
    rules: string[]
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
  reminder: { tasks: [], rules: [] },
  taskSuccess: { voucherName: '', rules: [] },
  result: createDefaultResult()
})

export function openTicketReminderDialog(options: OpenTicketReminderDialogOptions = {}) {
  globalTicketDialogState.reminder.tasks = options.tasks ?? []
  globalTicketDialogState.reminder.rules = options.rules ?? []
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
  globalTicketDialogState.reminder = { tasks: [], rules: [] }
  globalTicketDialogState.taskSuccess = { voucherName: '', rules: [] }
  globalTicketDialogState.result = createDefaultResult()
}
