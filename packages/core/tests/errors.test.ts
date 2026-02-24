import { describe, it, expect } from 'vitest'
import { MotosanError } from '@motosan-dev/core'

describe('MotosanError', () => {
  it('creates error with code and message', () => {
    const err = new MotosanError('NOT_FOUND', 'Video not found')
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toBe('Video not found')
    expect(err.name).toBe('MotosanError')
  })

  it('includes optional url and provider', () => {
    const err = new MotosanError('NETWORK_ERROR', 'Connection failed', {
      url: 'https://youtube.com/watch?v=abc',
      provider: 'youtube',
    })
    expect(err.url).toBe('https://youtube.com/watch?v=abc')
    expect(err.provider).toBe('youtube')
  })

  it('preserves cause error', () => {
    const cause = new Error('ECONNREFUSED')
    const err = new MotosanError('NETWORK_ERROR', 'Connection failed', { cause })
    expect(err.cause).toBe(cause)
  })

  it('serializes to JSON correctly', () => {
    const err = new MotosanError('PARSE_ERROR', 'Invalid response', {
      url: 'https://example.com',
      provider: 'youtube',
    })
    const json = err.toJSON()
    expect(json).toEqual({
      error: true,
      code: 'PARSE_ERROR',
      message: 'Invalid response',
      url: 'https://example.com',
      provider: 'youtube',
    })
  })

  it('toJSON output is valid JSON', () => {
    const err = new MotosanError('DEPENDENCY_MISSING', 'yt-dlp not found')
    const str = JSON.stringify(err.toJSON())
    const parsed = JSON.parse(str)
    expect(parsed.error).toBe(true)
    expect(parsed.code).toBe('DEPENDENCY_MISSING')
  })

  it('is instanceof Error', () => {
    const err = new MotosanError('NOT_FOUND', 'Not found')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(MotosanError)
  })
})
