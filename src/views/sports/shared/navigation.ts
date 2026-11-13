import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { sportItems, type SportItem } from '../components/sports-navigation/sport-items'

export function getSportsPath(sport: SportItem): string {
  const slug = sport.key === 'football' ? 'soccer' : sport.key
  return `/sports/${slug}-${sport.sportId}`
}

export function findRouteSport(value: unknown): SportItem | undefined {
  if (typeof value !== 'string') return undefined
  const match = /^[a-z]+(?:-[a-z]+)*-(\d+)$/.exec(value)
  return match ? sportItems.find(item => item.sportId === Number(match[1])) : undefined
}

export function isSportsHomepageRoute(route: Pick<RouteLocationNormalizedLoaded, 'name'>): boolean {
  return route.name === 'sports' || route.name === 'Localesports'
}
