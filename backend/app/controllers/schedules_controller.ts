import type { HttpContext } from '@adonisjs/core/http'
import { theaterQueryValidator } from '#validators/theater_query'
import ScheduleService from '#services/schedule_service'

export default class SchedulesController {
  async index({ request }: HttpContext) {
    const { days = 0 } = await request.validateUsing(theaterQueryValidator)
    const service = new ScheduleService()
    return service.getSchedules(days)
  }
}
