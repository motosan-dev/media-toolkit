import type { Platform } from './base.js'
import type { MediaInfo } from '../types.js'

const YOUTUBE_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
]

export const youtubePlatform: Platform = {
  name: 'youtube',

  canHandle(url: string): boolean {
    return YOUTUBE_PATTERNS.some(pattern => pattern.test(url))
  },

  parseUrl(url: string): MediaInfo {
    for (const pattern of YOUTUBE_PATTERNS) {
      const match = url.match(pattern)
      if (match) {
        return { url, platform: 'youtube', videoId: match[1] }
      }
    }
    return { url, platform: 'youtube' }
  },
}
