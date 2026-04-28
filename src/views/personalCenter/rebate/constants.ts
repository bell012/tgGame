import type { RebateRuleSection } from './types'

type TranslateFn = (key: string) => string

export const createRebateRuleSections = (t: TranslateFn): RebateRuleSection[] => [
  {
    title: t('rebatePage.rulesPopup.sections.rebateExplanation.title'),
    content: t('rebatePage.rulesPopup.sections.rebateExplanation.content')
  },
  {
    title: t('rebatePage.rulesPopup.sections.calculationPeriod.title'),
    content: t('rebatePage.rulesPopup.sections.calculationPeriod.content')
  },
  {
    title: t('rebatePage.rulesPopup.sections.claimRules.title'),
    content: t('rebatePage.rulesPopup.sections.claimRules.content')
  },
  {
    title: t('rebatePage.rulesPopup.sections.payoutMethod.title'),
    content: t('rebatePage.rulesPopup.sections.payoutMethod.content')
  },
  {
    title: t('rebatePage.rulesPopup.sections.validBetRules.title'),
    content: t('rebatePage.rulesPopup.sections.validBetRules.content'),
    items: [
      t('rebatePage.rulesPopup.sections.validBetRules.items.0'),
      t('rebatePage.rulesPopup.sections.validBetRules.items.1'),
      t('rebatePage.rulesPopup.sections.validBetRules.items.2')
    ]
  },
  {
    title: t('rebatePage.rulesPopup.sections.calculationFormula.title'),
    content: t('rebatePage.rulesPopup.sections.calculationFormula.content')
  }
]
