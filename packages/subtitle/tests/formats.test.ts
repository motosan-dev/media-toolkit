import { describe, it, expect } from 'vitest'
import { toSrt, toVtt, toText, formatSubtitle } from '@motosan-dev/subtitle'
import type { Subtitle } from '@motosan-dev/subtitle'

const mockSubtitle: Subtitle = {
  url: 'https://youtube.com/watch?v=test',
  lang: 'en',
  source: 'official',
  provider: 'youtube',
  fetchedAt: '2025-01-01T00:00:00Z',
  segments: [
    { start: 0, end: 2500, text: 'Hello world' },
    { start: 3000, end: 5500, text: 'This is a test' },
    { start: 60000, end: 62000, text: 'One minute mark' },
    { start: 3661000, end: 3663500, text: 'One hour one minute one second' },
  ],
}

describe('toSrt', () => {
  it('formats segments as SRT with correct timestamps', () => {
    const srt = toSrt(mockSubtitle)
    const lines = srt.split('\n')

    // First segment
    expect(lines[0]).toBe('1')
    expect(lines[1]).toBe('00:00:00,000 --> 00:00:02,500')
    expect(lines[2]).toBe('Hello world')

    // Second segment
    expect(lines[4]).toBe('2')
    expect(lines[5]).toBe('00:00:03,000 --> 00:00:05,500')
    expect(lines[6]).toBe('This is a test')
  })

  it('formats hours correctly', () => {
    const srt = toSrt(mockSubtitle)
    expect(srt).toContain('01:01:01,000 --> 01:01:03,500')
  })
})

describe('toVtt', () => {
  it('starts with WEBVTT header', () => {
    const vtt = toVtt(mockSubtitle)
    expect(vtt).toMatch(/^WEBVTT\n\n/)
  })

  it('uses dot as millisecond separator (not comma)', () => {
    const vtt = toVtt(mockSubtitle)
    expect(vtt).toContain('00:00:00.000 --> 00:00:02.500')
  })
})

describe('toText', () => {
  it('returns plain text, one line per segment', () => {
    const text = toText(mockSubtitle)
    const lines = text.split('\n')
    expect(lines).toHaveLength(4)
    expect(lines[0]).toBe('Hello world')
    expect(lines[1]).toBe('This is a test')
  })
})

describe('formatSubtitle', () => {
  it('returns SRT when format is srt', () => {
    const result = formatSubtitle(mockSubtitle, 'srt')
    expect(result).toContain('00:00:00,000 --> 00:00:02,500')
  })

  it('returns VTT when format is vtt', () => {
    const result = formatSubtitle(mockSubtitle, 'vtt')
    expect(result).toMatch(/^WEBVTT/)
  })

  it('returns text when format is text', () => {
    const result = formatSubtitle(mockSubtitle, 'text')
    expect(result).toBe('Hello world\nThis is a test\nOne minute mark\nOne hour one minute one second')
  })

  it('returns JSON when format is json', () => {
    const result = formatSubtitle(mockSubtitle, 'json')
    const parsed = JSON.parse(result)
    expect(parsed.segments).toHaveLength(4)
  })
})
