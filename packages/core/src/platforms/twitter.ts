import type { Platform } from './base.js'
import type { MediaInfo } from '../types.js'

const TWITTER_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/,
]

export const twitterPlatform: Platform = {
  name: 'twitter',

  canHandle(url: string): boolean {
    return TWITTER_PATTERNS.some(pattern => pattern.test(url))
  },

  parseUrl(url: string): MediaInfo {
    for (const pattern of TWITTER_PATTERNS) {
      const match = url.match(pattern)
      if (match) {
        return { url, platform: 'twitter', videoId: match[1] }
      }
    }
    return { url, platform: 'twitter' }
  },
}
