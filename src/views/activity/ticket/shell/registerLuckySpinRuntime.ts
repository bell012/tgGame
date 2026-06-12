import type { InjectionKey } from 'vue'
import type { LuckySpinRuntimeExpose } from '../components/lucky-spin/useLuckySpinRuntime'

export type RegisterLuckySpinRuntime = (runtime: LuckySpinRuntimeExpose | null) => void

export const REGISTER_LUCKY_SPIN_RUNTIME_KEY: InjectionKey<RegisterLuckySpinRuntime> = Symbol(
  'registerLuckySpinRuntime'
)
