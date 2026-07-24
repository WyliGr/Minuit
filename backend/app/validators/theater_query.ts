import vine from '@vinejs/vine'

export const theaterQueryValidator = vine.compile(
  vine.object({
    days: vine.number().min(0).max(30).optional(),
  })
)
