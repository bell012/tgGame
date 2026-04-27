import { globalShowToast } from '@/utils/toast'

interface DefaultTarget {
  rowId?: string | number | null
  cardType?: string | number | null
  defaultCard?: number | null
}

interface UseMemberCardDefaultFlowOptions<T> {
  resolveTarget: (input: T) => DefaultTarget | null
  alreadyDefaultMessage: string
  updateFailedMessage: string
  duration?: number
  submitDefault: (rowId: string | number, cardType: string | number) => Promise<boolean>
  onSuccess?: (input: T) => void | Promise<void>
}

export function useMemberCardDefaultFlow<T>(options: UseMemberCardDefaultFlowOptions<T>) {
  const duration = options.duration ?? 3000

  const setDefault = async (input: T) => {
    const target = options.resolveTarget(input)

    if (
      !target ||
      target.rowId == null ||
      String(target.rowId).trim() === '' ||
      target.cardType == null ||
      String(target.cardType).trim() === ''
    ) {
      return false
    }

    if (Number(target.defaultCard ?? 0) === 1) {
      globalShowToast({
        message: options.alreadyDefaultMessage,
        type: 'fail',
        duration
      })
      return false
    }

    const success = await options.submitDefault(target.rowId, target.cardType)

    if (!success) {
      globalShowToast({
        message: options.updateFailedMessage,
        type: 'fail',
        duration
      })
      return false
    }

    await options.onSuccess?.(input)
    return true
  }

  return {
    setDefault
  }
}
