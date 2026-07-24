import type { HttpContext } from '@adonisjs/core/http'
import { theaterQueryValidator } from '#validators/theater_query'
import ScheduleService, { parseDaysParam } from '#services/schedule_service'

export default class SchedulesController {
  async index({ request }: HttpContext) {
    const { days } = await request.validateUsing(theaterQueryValidator)
    const offsets = parseDaysParam(days)
    // `?fresh=1` forces a re-scrape from Allocine, bypassing the SQLite cache.
    // Used to recover from stale cache rows when the upstream response shape
    // changes (e.g. new fields) without waiting for the TTL to expire.
    const fresh = request.qs().fresh === '1' || request.qs().fresh === 'true'
    const service = new ScheduleService()
    return service.getSchedules(offsets, { fresh })
  }
}
