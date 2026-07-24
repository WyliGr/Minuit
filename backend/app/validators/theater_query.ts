import vine from '@vinejs/vine'

const daysRule = vine.createRule((value, _, field) => {
  if (value === undefined || value === null || value === '') {
    field.mutate(0, field)
    return
  }

  const v = String(value)

  if (/^\d+$/.test(v)) {
    const n = Number.parseInt(v, 10)
    if (n < 0 || n > 30) {
      field.report('The days field must be between 0 and 30', 'days.range', field)
      return
    }
    field.mutate(n, field)
    return
  }

  if (/^\d{1,2}-\d{1,2}$/.test(v)) {
    const [from, to] = v.split('-').map((x) => Number.parseInt(x, 10))
    if (from < 0 || to > 30 || from > to) {
      field.report('The days range must be 0-30 with from <= to', 'days.range', field)
      return
    }
    field.mutate(v, field)
    return
  }

  field.report('The days field must be a number (0-30) or a range like "0-6"', 'days.format', field)
})

export const theaterQueryValidator = vine.compile(
  vine.object({
    days: vine.any().use(daysRule()).optional(),
  })
)
