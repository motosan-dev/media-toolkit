import type { Platform } from './base.js'
import type { MediaInfo } from '../types.js'
import { MotosanError } from '../errors.js'
import { youtubePlatform } from './youtube.js'
import { bilibiliPlatform } from './bilibili.js'
import { tiktokPlatform } from './tiktok.js'
import { twitterPlatform } from './twitter.js'
import { podcastPlatform } from './podcast.js'
import { localPlatform } from './local.js'

export type { Platform }

/**
 * Ordered list of supported platforms.
 * First match wins — order matters for ambiguous URLs.
 */
export const PLATFORMS: Platform[] = [
  youtubePlatform,
  bilibiliPlatform,
  tiktokPlatform,
  twitterPlatform,
  podcastPlatform,
  localPlatform,
]

/**
 * Identify which platform a URL belongs to.
 * Throws MotosanError with code 'UNSUPPORTED' if no platform matches.
 */
export function identifyPlatform(url: string): MediaInfo {
  const platform = PLATFORMS.find(p => p.canHandle(url))
  if (!platform) {
    throw new MotosanError('UNSUPPORTED', `No platform found for URL: ${url}`, {
      url,
    })
  }
  return platform.parseUrl(url)
}
