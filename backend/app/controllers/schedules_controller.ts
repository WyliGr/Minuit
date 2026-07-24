import type { HttpContext } from '@adonisjs/core/http'
import { theaterQueryValidator } from '#validators/theater_query'
import ScheduleService, { parseDaysParam } from '#services/schedule_service'

export default class SchedulesController {
  async index({ request }: HttpContext) {
    const { days } = await request.validateUsing(theaterQueryValidator)
    const offsets = parseDaysParam(days)
    const service = new ScheduleService()
    return service.getSchedules(offsets)
  }
}
