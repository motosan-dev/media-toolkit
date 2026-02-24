import { exec, createLogger, identifyPlatform, checkYtDlp, MotosanError } from '@motosan-dev/core'
import type { Subtitle, SubtitleFetchOptions, SubtitleLang, Segment } from '../types.js'
import { parseVtt } from '../parsers/vtt.js'
import { transcribe } from '../whisper.js'
import { readFile, unlink, readdir } from 'node:fs/promises'
import { join, dirname, basename } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'

const log = createLogger('subtitle:youtube')

/**
 * Check if URL is a YouTube URL.
 */
export function canHandle(url: string): boolean {
  try {
    const info = identifyPlatform(url)
    return info.platform === 'youtube'
  } catch {
    return false
  }
}

/**
 * Fetch subtitle from YouTube using yt-dlp.
 */
export async function fetchYouTubeSubtitle(
  url: string,
  opts: SubtitleFetchOptions = {}
): Promise<Subtitle> {
  const dep = await checkYtDlp()
  if (!dep.available) {
    throw new MotosanError('DEPENDENCY_MISSING', `yt-dlp is required. ${dep.installHint}`, { url, provider: 'youtube' })
  }

  const lang = opts.lang ?? 'zh-TW'
  const tempDir = tmpdir()
  const tempId = randomUUID()
  const tempBase = join(tempDir, `mtk-yt-${tempId}`)

  try {
    // Try official subtitles first
    log.debug(`Fetching official subtitles for ${url}, lang=${lang}`)
    const segments = await tryFetchSubs(url, lang, tempBase, false)
    if (segments) {
      return buildSubtitle(url, lang, 'official', segments)
    }

    // Try auto-generated if allowed
    if (opts.preferAuto !== false) {
      log.debug(`Trying auto-generated subtitles for ${url}`)
      const autoSegments = await tryFetchSubs(url, lang, tempBase, true)
      if (autoSegments) {
        return buildSubtitle(url, lang, 'auto', autoSegments)
      }
    }

    // Whisper fallback
    if (opts.fallbackWhisper) {
      log.info(`No subtitles found, falling back to Whisper transcription`)
      const whisperSegments = await transcribe(url, lang)
      return buildSubtitle(url, lang, 'whisper', whisperSegments)
    }

    throw new MotosanError('NOT_FOUND', `No subtitles found for ${url}`, { url, provider: 'youtube' })
  } finally {
    // Clean up temp files
    await cleanTempFiles(tempBase).catch(() => {})
  }
}

/**
 * List available subtitle languages for a YouTube video.
 */
export async function listYouTubeLangs(url: string): Promise<SubtitleLang[]> {
  const dep = await checkYtDlp()
  if (!dep.available) {
    throw new MotosanError('DEPENDENCY_MISSING', `yt-dlp is required. ${dep.installHint}`, { url, provider: 'youtube' })
  }

  try {
    const { stdout } = await exec('yt-dlp', ['--list-subs', '--skip-download', url])
    return parseSubList(stdout)
  } catch (err) {
    throw new MotosanError('NETWORK_ERROR', `Failed to list subtitles: ${(err as Error).message}`, { url, provider: 'youtube', cause: err as Error })
  }
}

async function tryFetchSubs(
  url: string,
  lang: string,
  tempBase: string,
  auto: boolean
): Promise<Segment[] | null> {
  const subFlag = auto ? '--write-auto-subs' : '--write-subs'
  const args = [
    subFlag,
    '--skip-download',
    '--sub-format', 'vtt',
    '--sub-langs', lang,
    '--output', tempBase,
    url,
  ]

  try {
    await exec('yt-dlp', args)
  } catch {
    return null
  }

  // Find the downloaded VTT file
  const possiblePaths = [
    `${tempBase}.${lang}.vtt`,
    `${tempBase}.${lang.replace('-', '_')}.vtt`,
  ]

  for (const filePath of possiblePaths) {
    try {
      const content = await readFile(filePath, 'utf-8')
      return parseVtt(content)
    } catch {
      continue
    }
  }

  return null
}

function buildSubtitle(
  url: string,
  lang: string,
  source: 'official' | 'auto' | 'whisper',
  segments: Segment[]
): Subtitle {
  return {
    url,
    lang,
    source,
    provider: 'youtube',
    segments,
    fetchedAt: new Date().toISOString(),
  }
}

function parseSubList(output: string): SubtitleLang[] {
  const langs: SubtitleLang[] = []
  const lines = output.split('\n')
  let section: 'manual' | 'auto' | null = null

  for (const line of lines) {
    if (line.includes('Available subtitles')) section = 'manual'
    else if (line.includes('Available automatic captions')) section = 'auto'
    else if (section && line.match(/^\s*\w/)) {
      const match = line.match(/^\s*(\S+)\s+(.+)/)
      if (match) {
        langs.push({
          code: match[1],
          name: match[2].trim(),
          source: section === 'manual' ? 'official' : 'auto',
        })
      }
    }
  }
  return langs
}

async function cleanTempFiles(base: string): Promise<void> {
  const dir = dirname(base)
  const prefix = basename(base)
  const files = await readdir(dir)
  for (const file of files) {
    if (file.startsWith(prefix)) {
      await unlink(join(dir, file)).catch(() => {})
    }
  }
}
