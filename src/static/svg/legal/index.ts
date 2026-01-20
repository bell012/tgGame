import type { Component } from 'vue'
import aml from './aml.svg?component'
import fairness from './fairness.svg?component'
import gamble_aware from './gamble_aware.svg?component'
import privacy_policy from './privacy_policy.svg?component'
import tg_licenses from './tg_licenses.svg?component'
import terms_of_service from './terms_of_service.svg?component'

export const legalIcons: Record<string, Component> = {
  aml,
  fairness,
  gamble_aware,
  privacy_policy,
  tg_licenses,
  terms_of_service
}

export default legalIcons
