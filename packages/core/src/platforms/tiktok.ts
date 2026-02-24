import type { Platform } from './base.js'
import type { MediaInfo } from '../types.js'

const TIKTOK_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^/]+\/video\/(\d+)/,
  /(?:https?:\/\/)?vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
  /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/t\/([a-zA-Z0-9]+)/,
]

export const tiktokPlatform: Platform = {
  name: 'tiktok',

  canHandle(url: string): boolean {
    return TIKTOK_PATTERNS.some(pattern => pattern.test(url))
  },

  parseUrl(url: string): MediaInfo {
    for (const pattern of TIKTOK_PATTERNS) {
      const match = url.match(pattern)
      if (match) {
        return { url, platform: 'tiktok', videoId: match[1] }
      }
    }
    return { url, platform: 'tiktok' }
  },
}
