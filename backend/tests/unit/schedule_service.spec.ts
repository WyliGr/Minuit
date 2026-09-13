import { test } from '@japa/runner'
import { parseDaysParam, isStale } from '#services/schedule_service'
import { DateTime } from 'luxon'

test.group('parseDaysParam', () => {
  test('defaults to today', ({ assert }) => {
    assert.deepEqual(parseDaysParam(undefined), [0])
  })

  test('accepts a single number', ({ assert }) => {
    assert.deepEqual(parseDaysParam(3), [3])
  })

  test('accepts a number as string via validator output', ({ assert }) => {
    // validator may hand us a number or the raw string
    assert.deepEqual(parseDaysParam('0-6'), [0, 1, 2, 3, 4, 5, 6])
  })

  test('rejects out-of-bounds single day', ({ assert }) => {
    assert.throws(() => parseDaysParam(31))
    assert.throws(() => parseDaysParam(-1))
  })

  test('rejects reversed range', ({ assert }) => {
    assert.throws(() => parseDaysParam('6-0'))
  })

  test('rejects garbage', ({ assert }) => {
    assert.throws(() => parseDaysParam('abc'))
    assert.throws(() => parseDaysParam(''))
  })
})

test.group('isStale', () => {
  test('fresh within TTL', ({ assert }) => {
    const now = DateTime.now()
    assert.isFalse(isStale(now.minus({ minutes: 100 }), now))
  })

  test('stale past TTL', ({ assert }) => {
    const now = DateTime.now()
    assert.isTrue(isStale(now.minus({ minutes: 361 }), now))
  })
})
