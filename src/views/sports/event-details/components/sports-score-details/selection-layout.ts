import type { SportWagerSelection } from '@/api/interface/sport'
import { selectionLayoutRules } from './selection-layout-rules'

type Slot = SportWagerSelection | undefined

export interface SelectionLayout {
  columns: 2 | 3
  rows: Slot[][]
}

// 足球及文档使用同一比分 ID 的虚拟足球。其他球种的波胆不可套用这套 ID。
const soccerSports = new Set([1, 39, 44, 46, 47, 49, 52, 53, 54])
const scoreColumns: readonly (readonly number[])[] = [
  [17, 22, 23, 27, 28, 29, 32, 33, 34, 35, 775, 776, 777, 778, 779, 37],
  [12, 18, 24, 30, 36, 780, 439],
  [13, 14, 15, 16, 770, 19, 20, 21, 771, 25, 26, 772, 31, 773, 774, 38]
]

const chunk = <T>(items: readonly T[], size: number): Array<Array<T | undefined>> => {
  const rows: Array<Array<T | undefined>> = []
  for (let index = 0; index < items.length; index += size) {
    const row: Array<T | undefined> = items.slice(index, index + size)
    while (row.length < size) row.push(undefined)
    rows.push(row)
  }
  return rows
}

/** 只重排显示引用，不修改 DTO，也不跨 MarketlineId 拼接投注选项。 */
export const resolveSelectionLayout = (
  sportId: number | undefined,
  betTypeId: number,
  selections: readonly SportWagerSelection[]
): SelectionLayout | undefined => {
  if (sportId === undefined) return undefined
  if (betTypeId === 6 && soccerSports.has(sportId)) {
    const known = new Set(scoreColumns.flat())
    const columns = scoreColumns.map(ids =>
      ids.flatMap(id => selections.filter(selection => selection.SelectionId === id))
    )
    const rows: Slot[][] = Array.from(
      { length: Math.max(...columns.map(column => column.length)) },
      (_, index) => columns.map(column => column[index])
    )
    // 未定义 ID 不猜比分、也不丢弃；保留接口顺序，另起行展示。
    rows.push(
      ...chunk(
        selections.filter(selection => !known.has(selection.SelectionId)),
        3
      )
    )
    return { columns: 3, rows }
  }
  const rule = selectionLayoutRules.find(
    ([sports, type]) => type === betTypeId && sports.includes(sportId)
  )
  if (!rule) return undefined
  const [, , columns, ids] = rule
  const rows: Slot[][] = []
  for (const group of chunk(ids, columns)) {
    const slots = group.map(id => selections.filter(selection => selection.SelectionId === id))
    // 重复 SelectionId 仍保留每个原始 WagerSelectionId；缺项留空，不让后组补位。
    for (let index = 0; index < Math.max(...slots.map(slot => slot.length)); index++) {
      rows.push(slots.map(slot => slot[index]))
    }
  }
  rows.push(
    ...chunk(
      selections.filter(selection => !ids.includes(selection.SelectionId)),
      columns
    )
  )
  return { columns, rows }
}
