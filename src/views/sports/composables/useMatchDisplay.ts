import { computed, onScopeDispose, shallowRef } from 'vue'
import type { SportCompetitionGroup, SportEvent } from '@/api/interface/sport'
import { reuseEqual, reuseList } from '@/stores/sports'
import { mapSportsMatches } from '../shared/match'
import type { SportsMatch } from '../shared/types'

type DisplayOptions = {
  sportId: () => number
  groups: () => readonly SportCompetitionGroup[]
  hotEvents: () => readonly SportEvent[]
  teamLogoUrl: (id: number) => string
  clockUpdatedAt: (sportId: number, eventId: number) => number
}

export const useMatchDisplay = (options: DisplayOptions) => {
  const createEntry = (sportId: number, group: SportCompetitionGroup, event: SportEvent) => {
    const source = shallowRef({ ...group, Sports: [event] })
    const match = computed<SportsMatch | undefined>(previous => {
      const next = mapSportsMatches(
        [source.value],
        sportId,
        options.teamLogoUrl,
        undefined,
        options.clockUpdatedAt
      )[0]
      return reuseEqual(previous, next)
    })
    return { source, match }
  }
  const entries = new Map<string, ReturnType<typeof createEntry>>()
  const catalog = computed(() => {
    const sportId = options.sportId()
    const sources = new Map<string, { group: SportCompetitionGroup; event: SportEvent }>()
    const collect = (groups: readonly SportCompetitionGroup[]) => {
      const ids = new Set<string>()
      for (const group of groups) {
        for (const event of group.Sports) {
          if (!Number.isSafeInteger(event.EventId) || event.EventId <= 0) continue
          const id = `${sportId}:${event.EventId}`
          if (ids.has(id)) continue
          ids.add(id)
          sources.set(id, { group, event })
        }
      }
      return [...ids]
    }
    const hotIds = collect(
      options.hotEvents().map(event => ({
        ...event.Competition,
        competitionCount: 1,
        Sports: [event]
      }))
    )
    const matchIds = collect(options.groups())
    for (const [id, { group, event }] of sources) {
      const entry = entries.get(id)
      if (!entry) entries.set(id, createEntry(sportId, group, event))
      else if (
        entry.source.value.Sports[0] !== event ||
        entry.source.value.CompetitionId !== group.CompetitionId ||
        entry.source.value.CompetitionName !== group.CompetitionName
      )
        entry.source.value = { ...group, Sports: [event] }
    }
    for (const id of entries.keys()) if (!sources.has(id)) entries.delete(id)
    return { hotIds, matchIds }
  })
  const readMatches = (ids: string[]) =>
    ids.flatMap(id => {
      const match = entries.get(id)?.match.value
      return match ? [match] : []
    })
  const matches = computed<SportsMatch[]>(previous =>
    reuseList(previous ?? [], readMatches(catalog.value.matchIds))
  )
  const liveMatches = computed<SportsMatch[]>(previous =>
    reuseList(previous ?? [], readMatches(catalog.value.hotIds))
  )
  const matchById = computed(
    () => new Map([...liveMatches.value, ...matches.value].map(match => [match.id, match]))
  )
  onScopeDispose(() => entries.clear())
  return { matches, liveMatches, matchById }
}
