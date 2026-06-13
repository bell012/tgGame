import { ref } from 'vue'
import type { HelpSection, TaskItem } from './ticketTaskMapper'

export const useTaskHelpPop = () => {
  const ruleVisible = ref(false)
  const activeHelp = ref({
    title: '',
    content: '',
    sections: [] as HelpSection[]
  })

  const openTaskRule = (task: TaskItem) => {
    activeHelp.value = {
      title: task.descriptionTitle ?? task.helpSections?.[0]?.title ?? task.title,
      content: task.description ?? '',
      sections: task.helpSections ?? []
    }
    ruleVisible.value = true
  }

  return {
    ruleVisible,
    activeHelp,
    openTaskRule
  }
}
