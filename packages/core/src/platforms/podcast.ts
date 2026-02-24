import type { Platform } from './base.js'
import type { MediaInfo } from '../types.js'

const PODCAST_PATTERNS = [
  /\.(?:mp3|m4a|ogg|opus|wav)(?:\?.*)?$/i,
  /(?:https?:\/\/)?[^/]+\/.*feed/i,
  /(?:https?:\/\/)?[^/]+\/.*rss/i,
]

export const podcastPlatform: Platform = {
  name: 'podcast',

  canHandle(url: string): boolean {
    return PODCAST_PATTERNS.some(pattern => pattern.test(url))
  },

  parseUrl(url: string): MediaInfo {
    return { url, platform: 'podcast' }
  },
}
