import type { Component } from 'vue'

export type RebateTab = 'records' | 'rules'

export interface RebateCategory {
  id: string
  label: string
  icon: string | Component
  activeIcon?: string | Component
}

export interface RebateRow {
  id: string
  validBets: string
  rebateRate: string
  isCurrent: boolean
}

export interface RebateRuleSection {
  title: string
  content: string
  items?: string[]
}
