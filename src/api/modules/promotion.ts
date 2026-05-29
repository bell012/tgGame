import type { LuckySpinDrawResponse, LuckySpinInfoResponse } from '@/api/interface/promotion'
import {
  createMockLuckySpinInfo,
  getMockRemainingSpins,
  mockDoLuckySpin
} from '@/api/mock/luckySpin'

const USE_MOCK = true

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const queryLuckySpinInfo = async (): Promise<LuckySpinInfoResponse> => {
  if (USE_MOCK) {
    await mockDelay()
    const info = createMockLuckySpinInfo()
    return {
      code: 0,
      message: 'success',
      success: true,
      result: { ...info, remainingSpins: getMockRemainingSpins() }
    }
  }

  throw new Error('Lucky Spin API not configured')
}

export const doLuckySpin = async (): Promise<LuckySpinDrawResponse> => {
  if (USE_MOCK) {
    await mockDelay(500)
    return {
      code: 0,
      message: 'success',
      success: true,
      result: mockDoLuckySpin()
    }
  }

  throw new Error('Lucky Spin API not configured')
}
