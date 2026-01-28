export type ILottery = {
  id: string
  name: string
  country: string
  topPrize?: string
  drawTime?: string
  hasLike?: boolean
}

export type IGroupILottery = {
  name: string
  items: ILottery[]
}

// 43个国家名称 => 与雪碧图的国家顺序一一对应
export const COUNTRIES = [
  'Australia',
  'Austria',
  'Barbados',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'Colombia',
  'Denmark',
  'Finland',
  'France',
  'Germany',
  'Ghana',
  'Greece',
  'India',
  'Ireland',
  'Italy',
  'Japan',
  'Latvia',
  'Lithuania',
  'Malta',
  'Mauritius',
  'Morocco',
  'New Zealand',
  'Norway',
  'Peru',
  'Poland',
  'Romania',
  'Russia',
  'Singapore',
  'Slovakia',
  'South Africa',
  'Spain',
  'Sri Lanka',
  'Sweden',
  'Switzerland',
  'Turkiye',
  'UK',
  'Ukraine',
  'Uruguay',
  'USA',
  'BC',
  'Hong Kong',
  'Korea Republic'
]

export const groupByName = (lotteriesList: ILottery[]) => {
  const list: IGroupILottery[] = []
  lotteriesList.forEach(item => {
    const name = item.name[0]
    const index = list.findIndex(i => i.name === name)
    if (index === -1) {
      list.push({
        name,
        items: [item]
      })
    } else {
      list[index].items.push(item)
    }
  })
  return list
}

/**
 * 计算当前时间与目标时间的时间差
 * @param targetTime 目标时间（毫秒）
 * @returns 返回当前时间与目标时间的时间差（格式：00h:00m:00s）
 */
export const getTimeDifference = (targetTime: number) => {
  const currentTime = new Date().getTime()
  const timeDifference = targetTime - currentTime

  if (timeDifference <= 0) {
    return 'h:m:s'
  }

  const hours = Math.floor(timeDifference / (1000 * 60 * 60))
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)
  const formattedTime = `${hours.toString().padStart(2)}h:${minutes.toString().padStart(2)}m:${seconds.toString().padStart(2)}s`

  return formattedTime
}
