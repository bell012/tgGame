export interface MatchHeaderCards {
  red: number
  yellow: number
}

export interface MatchHeaderTeam {
  name: string
  logo: string
  cards: MatchHeaderCards
}

export type MatchHeaderPhase = 'prematch' | 'live'

export type MatchHeaderView = 'info' | 'video' | 'animation'

export interface MatchHeaderFilter {
  key: string
  label: string
}

export interface MatchHeaderCallout {
  title: string
  detail: string
}

export interface MatchHeaderViewModel {
  league: string
  phase: MatchHeaderPhase
  home: MatchHeaderTeam
  away: MatchHeaderTeam
  homeScore: number
  awayScore: number
  kickoffText: string
  durationText: string
  phaseText: string
  periodScoreText: string
  clockText: string
  cornerScore: string
  halfTimeScore: string
  callout?: MatchHeaderCallout
  videoSrc?: string
  videoPoster?: string
  filters: MatchHeaderFilter[]
}
