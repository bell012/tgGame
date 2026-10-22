import type { LoanRecordFilter } from '../mock'

export interface LoanRecordTypeOption {
  value: LoanRecordFilter
  label: string
}

export interface LoanRecordDisplayItem {
  id: string
  typeLabel: string
  amountText: string
  timeText: string
}
