import type { Platform } from './base.js'
import type { MediaInfo } from '../types.js'

export const localPlatform: Platform = {
  name: 'local',

  canHandle(url: string): boolean {
    return (
      url.startsWith('file://') ||
      url.startsWith('/') ||
      /^[A-Z]:\\/i.test(url)
    )
  },

  parseUrl(url: string): MediaInfo {
    return { url, platform: 'local' }
  },
}
