export type EventDetailMatchStatus =
  | { kind: 'live'; minute: string; period: string }
  | { kind: 'half_time' }
  | { kind: 'finished' }
  | { kind: 'scheduled'; primary: string; secondary?: string }

export type EventDetailTabItem = {
  id: string
  home: { name: string; score: number | null }
  away: { name: string; score: number | null }
  status: EventDetailMatchStatus
}
