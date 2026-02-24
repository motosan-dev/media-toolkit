import { createLogger, identifyPlatform, MotosanError } from '@motosan-dev/core'
import type { Subtitle, SubtitleFetchOptions, SubtitleLang } from '../types.js'
import { parseBilibiliJson } from '../parsers/json.js'
import { transcribe } from '../whisper.js'

const log = createLogger('subtitle:bilibili')

export function canHandle(url: string): boolean {
  try {
    const info = identifyPlatform(url)
    return info.platform === 'bilibili'
  } catch {
    return false
  }
}

/**
 * Fetch subtitle from Bilibili using their public API.
 */
export async function fetchBilibiliSubtitle(
  url: string,
  opts: SubtitleFetchOptions = {}
): Promise<Subtitle> {
  const lang = opts.lang ?? 'zh-CN'
  const info = identifyPlatform(url)
  const bvid = info.videoId

  if (!bvid) {
    throw new MotosanError('PARSE_ERROR', 'Could not extract BV ID from URL', { url, provider: 'bilibili' })
  }

  try {
    // Step 1: Get cid from video info
    log.debug(`Fetching video info for ${bvid}`)
    const cidUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
    const cidResp = await fetch(cidUrl)
    const cidData = await cidResp.json() as { data?: { cid?: number } }
    const cid = cidData?.data?.cid

    if (!cid) {
      throw new MotosanError('PARSE_ERROR', 'Could not get cid from Bilibili API', { url, provider: 'bilibili' })
    }

    // Step 2: Get subtitle list
    log.debug(`Fetching subtitles for bvid=${bvid}, cid=${cid}`)
    const subUrl = `https://api.bilibili.com/x/player/v2?bvid=${bvid}&cid=${cid}`
    const subResp = await fetch(subUrl)
    const subData = await subResp.json() as {
      data?: { subtitle?: { subtitles?: Array<{ lan: string; lan_doc: string; subtitle_url: string }> } }
    }

    const subtitles = subData?.data?.subtitle?.subtitles ?? []

    if (subtitles.length === 0) {
      if (opts.fallbackWhisper) {
        log.info('No subtitles found on Bilibili, falling back to Whisper')
        const segments = await transcribe(url, lang)
        return {
          url, lang, source: 'whisper', provider: 'bilibili',
          segments, fetchedAt: new Date().toISOString(),
        }
      }
      throw new MotosanError('NOT_FOUND', 'No subtitles available', { url, provider: 'bilibili' })
    }

    // Find best matching language
    const match = subtitles.find(s => s.lan === lang) ?? subtitles[0]
    log.debug(`Using subtitle: ${match.lan} (${match.lan_doc})`)

    // Step 3: Fetch subtitle content
    let subtitleUrl = match.subtitle_url
    if (subtitleUrl.startsWith('//')) subtitleUrl = `https:${subtitleUrl}`

    const contentResp = await fetch(subtitleUrl)
    const content = await contentResp.json() as { body: Array<{ from: number; to: number; content: string }> }
    const segments = parseBilibiliJson(content)

    return {
      url, lang: match.lan, source: 'official', provider: 'bilibili',
      segments, fetchedAt: new Date().toISOString(),
    }
  } catch (err) {
    if (err instanceof MotosanError) throw err
    throw new MotosanError('NETWORK_ERROR', `Bilibili API error: ${(err as Error).message}`, { url, provider: 'bilibili', cause: err as Error })
  }
}

export async function listBilibiliLangs(url: string): Promise<SubtitleLang[]> {
  const info = identifyPlatform(url)
  const bvid = info.videoId
  if (!bvid) return []

  try {
    const cidUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
    const cidResp = await fetch(cidUrl)
    const cidData = await cidResp.json() as { data?: { cid?: number } }
    const cid = cidData?.data?.cid
    if (!cid) return []

    const subUrl = `https://api.bilibili.com/x/player/v2?bvid=${bvid}&cid=${cid}`
    const subResp = await fetch(subUrl)
    const subData = await subResp.json() as {
      data?: { subtitle?: { subtitles?: Array<{ lan: string; lan_doc: string }> } }
    }

    return (subData?.data?.subtitle?.subtitles ?? []).map(s => ({
      code: s.lan, name: s.lan_doc, source: 'official' as const,
    }))
  } catch {
    return []
  }
}
