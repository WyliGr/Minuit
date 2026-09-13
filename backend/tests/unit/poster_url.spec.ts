import { test } from '@japa/runner'
import { ValidationError } from '@vinejs/vine'
import { posterUrlValidator } from '#validators/poster_url'

async function rejectionRule(input: Record<string, unknown>): Promise<string> {
  try {
    await posterUrlValidator.validate(input)
  } catch (err) {
    if (err instanceof ValidationError) {
      return err.messages[0].rule
    }
    throw err
  }
  return 'no-error'
}

test.group('posterUrlValidator', () => {
  test('accepts allowed acsta host', async ({ assert }) => {
    const out = await posterUrlValidator.validate({
      url: 'https://fr.web.img6.acsta.net/img/c5/3a/p.jpg',
    })
    assert.equal(out.url, 'https://fr.web.img6.acsta.net/img/c5/3a/p.jpg')
  })

  test('rejects missing url', async ({ assert }) => {
    assert.equal(await rejectionRule({}), 'required')
  })

  test('rejects http', async ({ assert }) => {
    assert.equal(await rejectionRule({ url: 'http://fr.web.img6.acsta.net/p.jpg' }), 'protocol')
  })

  test('rejects foreign host (SSRF guard)', async ({ assert }) => {
    assert.equal(await rejectionRule({ url: 'https://evil.example.com/p.jpg' }), 'host')
  })
})
