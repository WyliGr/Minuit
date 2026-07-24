import vine from '@vinejs/vine'

const ALLOWED_HOSTS = [
  'fr.web.img6.acsta.net',
  'fr.web.img5.acsta.net',
  'fr.web.img4.acsta.net',
  'fr.web.img3.acsta.net',
  'fr.web.img2.acsta.net',
  'fr.web.img1.acsta.net',
  'fr.web.img0.acsta.net',
]

const posterUrlRule = vine.createRule((value, _, field) => {
  if (value === undefined || value === null || value === '') {
    field.report('The url field is required', 'required', field)
    return
  }

  let parsed: URL
  try {
    parsed = new URL(String(value))
  } catch {
    field.report('The url field must be a valid URL', 'url', field)
    return
  }

  if (parsed.protocol !== 'https:') {
    field.report('The url field must use https', 'protocol', field)
    return
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    field.report('The url field must point to an allowed image host', 'host', field)
    return
  }

  field.mutate(parsed.href, field)
})

export const posterUrlValidator = vine.compile(
  vine.object({
    url: vine.any().use(posterUrlRule()),
  })
)
