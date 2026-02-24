import type { Platform } from './base.js'
import type { MediaInfo } from '../types.js'

const BILIBILI_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/,
  /(?:https?:\/\/)?(?:www\.)?bilibili\.com\/video\/(av\d+)/,
  /(?:https?:\/\/)?b23\.tv\/([a-zA-Z0-9]+)/,
]

export const bilibiliPlatform: Platform = {
  name: 'bilibili',

  canHandle(url: string): boolean {
    return BILIBILI_PATTERNS.some(pattern => pattern.test(url))
  },

  parseUrl(url: string): MediaInfo {
    for (const pattern of BILIBILI_PATTERNS) {
      const match = url.match(pattern)
      if (match) {
        return { url, platform: 'bilibili', videoId: match[1] }
      }
    }
    return { url, platform: 'bilibili' }
  },
}
