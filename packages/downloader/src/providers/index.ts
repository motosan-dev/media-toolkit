import { identifyPlatform, MotosanError } from '@motosan-dev/core'
import type { DownloadOptions, DownloadResult } from '../types.js'
import { downloadYouTube } from './youtube.js'
import { downloadGeneric } from './generic.js'

/**
 * Download video from any supported URL.
 */
export async function downloadVideo(
  url: string,
  opts: DownloadOptions = {}
): Promise<DownloadResult> {
  const info = identifyPlatform(url)

  switch (info.platform) {
    case 'youtube':
      return downloadYouTube(url, opts)
    case 'bilibili':
    case 'tiktok':
    case 'twitter':
      return downloadGeneric(url, opts)
    default:
      throw new MotosanError('UNSUPPORTED', `Download not supported for ${info.platform}`, { url, provider: info.platform })
  }
}
