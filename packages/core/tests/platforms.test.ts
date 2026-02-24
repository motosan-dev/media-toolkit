import { describe, it, expect } from 'vitest'
import { identifyPlatform, MotosanError } from '@motosan-dev/core'

describe('identifyPlatform', () => {
  describe('YouTube', () => {
    it('identifies standard watch URL', () => {
      const info = identifyPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      expect(info.platform).toBe('youtube')
      expect(info.videoId).toBe('dQw4w9WgXcQ')
    })

    it('identifies short URL', () => {
      const info = identifyPlatform('https://youtu.be/dQw4w9WgXcQ')
      expect(info.platform).toBe('youtube')
      expect(info.videoId).toBe('dQw4w9WgXcQ')
    })

    it('identifies shorts URL', () => {
      const info = identifyPlatform('https://www.youtube.com/shorts/dQw4w9WgXcQ')
      expect(info.platform).toBe('youtube')
      expect(info.videoId).toBe('dQw4w9WgXcQ')
    })

    it('identifies embed URL', () => {
      const info = identifyPlatform('https://www.youtube.com/embed/dQw4w9WgXcQ')
      expect(info.platform).toBe('youtube')
      expect(info.videoId).toBe('dQw4w9WgXcQ')
    })

    it('identifies live URL', () => {
      const info = identifyPlatform('https://www.youtube.com/live/dQw4w9WgXcQ')
      expect(info.platform).toBe('youtube')
      expect(info.videoId).toBe('dQw4w9WgXcQ')
    })
  })

  describe('Bilibili', () => {
    it('identifies bilibili video URL', () => {
      const info = identifyPlatform('https://www.bilibili.com/video/BV1xx411c7mD')
      expect(info.platform).toBe('bilibili')
    })

    it('identifies b23.tv short URL', () => {
      const info = identifyPlatform('https://b23.tv/abc123')
      expect(info.platform).toBe('bilibili')
    })
  })

  describe('TikTok', () => {
    it('identifies TikTok video URL', () => {
      const info = identifyPlatform('https://www.tiktok.com/@user/video/1234567890')
      expect(info.platform).toBe('tiktok')
    })
  })

  describe('Twitter', () => {
    it('identifies twitter.com status URL', () => {
      const info = identifyPlatform('https://twitter.com/user/status/1234567890')
      expect(info.platform).toBe('twitter')
    })

    it('identifies x.com status URL', () => {
      const info = identifyPlatform('https://x.com/user/status/1234567890')
      expect(info.platform).toBe('twitter')
    })
  })

  describe('Local', () => {
    it('identifies local file path', () => {
      const info = identifyPlatform('/path/to/video.mp4')
      expect(info.platform).toBe('local')
    })

    it('identifies file:// URL', () => {
      const info = identifyPlatform('file:///path/to/video.mp4')
      expect(info.platform).toBe('local')
    })
  })

  describe('Unsupported', () => {
    it('throws MotosanError for unknown URLs', () => {
      expect(() => identifyPlatform('https://unknown-site.com/video'))
        .toThrow(MotosanError)
    })

    it('throws with UNSUPPORTED code', () => {
      try {
        identifyPlatform('https://unknown-site.com/video')
      } catch (err) {
        expect(err).toBeInstanceOf(MotosanError)
        expect((err as MotosanError).code).toBe('UNSUPPORTED')
      }
    })
  })
})
