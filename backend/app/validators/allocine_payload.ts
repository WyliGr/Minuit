import vine from '@vinejs/vine'

const showtimeSchema = vine.object({
  startsAt: vine.string(),
  diffusionVersion: vine.string().optional(),
  isPreview: vine.boolean().optional(),
  experience: vine.array(vine.string()).optional(),
  tags: vine.array(vine.string()).optional(),
})

const showtimesMapSchema = vine.record(vine.array(showtimeSchema).optional())

const posterSchema = vine.object({
  url: vine.string().optional(),
})

const movieSchema = vine.object({
  title: vine.string().optional(),
  runtime: vine.string().optional(),
  poster: posterSchema.optional(),
})

const resultSchema = vine.object({
  movie: movieSchema.optional(),
  showtimes: showtimesMapSchema.optional(),
})

export const allocinePayloadValidator = vine.compile(
  vine.object({
    results: vine.array(resultSchema),
  })
)
