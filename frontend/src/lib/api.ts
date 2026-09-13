export type TheaterListItem = {
  slug: string
  name: string
  isActive: boolean
}

export type Showtime = {
  time: string
  startsAt: string
  isVost: boolean
  isPreview: boolean
  format: string | null
}

export type Film = {
  title: string
  runtime: number
  posterUrl: string | null
  showtimes: Showtime[]
}

export type TheaterSlice = {
  slug: string
  name: string
  lastFetchedAt: string
  films: Film[]
}

export type DaySchedules = {
  date: string
  dayOffset: number
  displayDate: string
  generatedAt: string
  theaters: TheaterSlice[]
}

export type SchedulesRangeResponse = {
  days: DaySchedules[]
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export function fetchTheaters(): Promise<{ theaters: TheaterListItem[] }> {
  return request('/api/v1/theaters')
}

export function fetchDaySchedules(dayOffset: number): Promise<DaySchedules> {
  return request<DaySchedules | SchedulesRangeResponse>(
    `/api/v1/theater?days=${dayOffset}`
  ).then((res) => {
    if ('days' in res) {
      throw new ApiError(500, 'Expected single-day response, got range')
    }
    return res
  })
}

export function posterSrc(posterUrl: string | null): string | undefined {
  return posterUrl ?? undefined
}