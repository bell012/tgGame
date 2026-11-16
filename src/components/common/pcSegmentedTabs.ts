/** PC 连续底板分段栏；仅包含颜色和圆角，不改变业务组件的尺寸与间距。 */
export const PC_SEGMENTED_TABS_CLASS = 'rounded-[8px] bg-bg-8'
export const PC_SEGMENTED_TAB_CLASS = 'rounded-[8px]'

export const getPcSegmentedTabStateClass = (active: boolean) =>
  active ? 'bg-bg-7 text-text-1' : 'bg-transparent text-text-2'
