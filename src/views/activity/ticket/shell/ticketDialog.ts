import { reactive } from 'vue'
import type { MbTicketRecord } from '@/api/interface/activity'
import type {
  TicketReminderTask,
  TicketResultVariant,
  TicketVoucherCardData
} from '../shared/types'

export type TicketDialogKind = 'none' | 'reminder' | 'task_success' | 'result' | 'receive'

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
  nextTickets?: MbTicketRecord[]
}

export interface OpenTicketReceiveDialogOptions {
  nextTickets: MbTicketRecord[]
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
  nextTickets: MbTicketRecord[]
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
  receive: {
    nextTickets: MbTicketRecord[]
  }
}

const createDefaultResult = (): TicketResultDialogState => ({
  variant: 'cash',
  highlightText: '',
  vouchers: [],
  voucherCount: 0,
  nextTickets: []
})

export const globalTicketDialogState = reactive<GlobalTicketDialogState>({
  kind: 'none',
  reminder: { tasks: [], rules: [], voucherName: '', maxPrizeText: '' },
  taskSuccess: { voucherName: '', rules: [] },
  result: createDefaultResult(),
  receive: { nextTickets: [] }
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
  const nextTickets = options.nextTickets ?? []
  globalTicketDialogState.result = {
    ...createDefaultResult(),
    ...options,
    vouchers,
    voucherCount: options.voucherCount ?? vouchers.length,
    nextTickets
  }
  globalTicketDialogState.kind = 'result'
}

export function openTicketReceiveDialog(options: OpenTicketReceiveDialogOptions) {
  const nextTickets = options.nextTickets ?? []
  globalTicketDialogState.receive = {
    nextTickets
  }
  globalTicketDialogState.kind = 'receive'
}

export function closeTicketDialog() {
  globalTicketDialogState.kind = 'none'
  globalTicketDialogState.reminder = { tasks: [], rules: [], voucherName: '', maxPrizeText: '' }
  globalTicketDialogState.taskSuccess = { voucherName: '', rules: [] }
  globalTicketDialogState.result = createDefaultResult()
  globalTicketDialogState.receive = { nextTickets: [] }
}
