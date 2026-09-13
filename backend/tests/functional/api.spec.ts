import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('API', (group) => {
  let cleanup: (() => Promise<void>) | undefined

  group.each.setup(async () => {
    cleanup = await testUtils.db().migrate()
    await testUtils.db().seed()
    return () => cleanup?.()
  })

  test('GET / health check', async ({ client, assert }) => {
    const res = await client.get('/')
    assert.equal(res.status(), 200)
    assert.equal(res.body().name, 'minuit')
  })

  test('GET /api/v1/theaters returns seeded list', async ({ client, assert }) => {
    const res = await client.get('/api/v1/theaters')
    assert.equal(res.status(), 200)
    assert.isArray(res.body().theaters)
    assert.isAtLeast(res.body().theaters.length, 6)
  })

  test('GET /api/v1/theater rejects invalid days', async ({ client, assert }) => {
    const res = await client.get('/api/v1/theater').qs({ days: 'abc' })
    assert.equal(res.status(), 422)
  })

  test('GET /api/v1/poster rejects non-acsta host', async ({ client, assert }) => {
    const res = await client.get('/api/v1/poster').qs({ url: 'https://evil.example.com/x.jpg' })
    assert.equal(res.status(), 422)
  })
})
