import type { HttpContext } from '@adonisjs/core/http'
import Theater from '#models/theater'

export default class TheatersController {
  async index({}: HttpContext) {
    const theaters = await Theater.query().where('is_active', true).orderBy('id', 'asc')

    return {
      theaters: theaters.map((t) => ({
        slug: t.slug,
        name: t.name,
        isActive: t.isActive,
      })),
    }
  }
}
