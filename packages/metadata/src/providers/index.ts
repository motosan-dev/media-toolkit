import { identifyPlatform, MotosanError } from '@motosan-dev/core'
import type { VideoMetadata, MetadataOptions } from '../types.js'
import { fetchYouTubeMetadata } from './youtube.js'
import { fetchGenericMetadata } from './generic.js'

/**
 * Fetch video metadata from any supported URL.
 */
export async function fetchMetadata(
  url: string,
  opts: MetadataOptions = {}
): Promise<VideoMetadata> {
  const info = identifyPlatform(url)

  switch (info.platform) {
    case 'youtube':
      return fetchYouTubeMetadata(url, opts)
    case 'bilibili':
    case 'tiktok':
    case 'twitter':
      return fetchGenericMetadata(url, opts)
    default:
      throw new MotosanError('UNSUPPORTED', `Metadata not supported for ${info.platform}`, { url, provider: info.platform })
  }
}
