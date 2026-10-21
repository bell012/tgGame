export interface RedPacketItem {
  id: number
  sender: string
  date: string
  title: string
  subtitle?: string
  source: string
  time: string
  /** 设计稿中半透明展示的红包 */
  dimmed: boolean
}

export const redPacketMockList: RedPacketItem[] = [
  {
    id: 1,
    sender: 'TG Bonus Desk',
    date: '11/07 12:18',
    title: '$100',
    subtitle: "You've Got a Bonus!",
    source: 'Support Red Packet',
    time: '03:48 PM',
    dimmed: true
  },
  {
    id: 2,
    sender: 'TG Bonus Desk',
    date: '11/07 12:18',
    title: '$100',
    subtitle: "You've Got a Bonus!",
    source: 'Support Red Packet',
    time: '03:48 PM',
    dimmed: true
  },
  {
    id: 3,
    sender: 'TG Bonus Desk',
    date: '11/07 12:18',
    title: '$100',
    subtitle: "You've Got a Bonus!",
    source: 'Support Red Packet',
    time: '03:48 PM',
    dimmed: true
  },
  {
    id: 4,
    sender: 'TG Bonus Desk',
    date: '11/07 12:18',
    title: 'Fortune & Prosperity',
    source: 'Deposit Match Bonus',
    time: '03:48 PM',
    dimmed: false
  },
  {
    id: 5,
    sender: 'TG Bonus Desk',
    date: '11/07 12:18',
    title: '$100',
    subtitle: "You've Got a Bonus!",
    source: 'Loss Rebate',
    time: '03:48 PM',
    dimmed: false
  },
  {
    id: 6,
    sender: 'TG Bonus Desk',
    date: '11/07 12:18',
    title: '$50',
    subtitle: "You've Got a Bonus!",
    source: 'Deposit Match Bonus',
    time: '03:48 PM',
    dimmed: false
  },
  {
    id: 7,
    sender: 'TG Bonus Desk',
    date: '11/07 12:18',
    title: '$50',
    subtitle: 'Reveal Your Lucky Bonus',
    source: 'Lucky Bonus',
    time: '03:48 PM',
    dimmed: false
  }
]
