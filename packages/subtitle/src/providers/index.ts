import { identifyPlatform, MotosanError } from '@motosan-dev/core'
import type { Subtitle, SubtitleFetchOptions, SubtitleLang } from '../types.js'
import { fetchYouTubeSubtitle, listYouTubeLangs, canHandle as youtubeCanHandle } from './youtube.js'
import { fetchBilibiliSubtitle, listBilibiliLangs, canHandle as bilibiliCanHandle } from './bilibili.js'
import { fetchGenericSubtitle } from './generic.js'

/**
 * Fetch subtitles from any supported URL.
 * Routes to the appropriate provider based on URL.
 */
export async function fetchSubtitle(
  url: string,
  opts: SubtitleFetchOptions = {}
): Promise<Subtitle> {
  if (youtubeCanHandle(url)) {
    return fetchYouTubeSubtitle(url, opts)
  }
  if (bilibiliCanHandle(url)) {
    return fetchBilibiliSubtitle(url, opts)
  }

  // For TikTok, Twitter, and others — use generic yt-dlp approach
  try {
    identifyPlatform(url) // Validates URL is from a known platform
  } catch {
    throw new MotosanError('UNSUPPORTED', `Unsupported URL: ${url}`, { url })
  }

  return fetchGenericSubtitle(url, opts)
}

/**
 * List available subtitle languages for a URL.
 */
export async function listSubtitleLangs(url: string): Promise<SubtitleLang[]> {
  if (youtubeCanHandle(url)) {
    return listYouTubeLangs(url)
  }
  if (bilibiliCanHandle(url)) {
    return listBilibiliLangs(url)
  }
  return []
}
