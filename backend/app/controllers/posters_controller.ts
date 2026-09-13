import type { HttpContext } from '@adonisjs/core/http'
import { Readable } from 'node:stream'
import { posterUrlValidator } from '#validators/poster_url'

const POSTER_CACHE = 'public, max-age=2592000, immutable'

export default class PostersController {
  async show({ request, response }: HttpContext) {
    const { url } = await request.validateUsing(posterUrlValidator)

    const upstream = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'referer': 'https://www.allocine.fr/',
      },
    })

    if (!upstream.ok) {
      response.status(upstream.status)
      return response.send('Upstream error')
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'

    response.header('Content-Type', contentType)
    response.header('Cache-Control', POSTER_CACHE)
    // Stream instead of buffering — posters are small but this keeps memory flat.
    response.stream(upstream.body ?? Readable.from([]), () => [
      'Upstream stream error',
      upstream.status ?? 502,
    ])
  }
}
