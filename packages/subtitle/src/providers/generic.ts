import { exec, createLogger, identifyPlatform, checkYtDlp, MotosanError } from '@motosan-dev/core'
import type { Subtitle, SubtitleFetchOptions } from '../types.js'
import { parseVtt } from '../parsers/vtt.js'
import { transcribe } from '../whisper.js'
import { readFile, unlink, readdir } from 'node:fs/promises'
import { join, dirname, basename } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'

const log = createLogger('subtitle:generic')

/**
 * Generic subtitle fetcher using yt-dlp.
 * Works for TikTok, Twitter, and other yt-dlp supported platforms.
 */
export async function fetchGenericSubtitle(
  url: string,
  opts: SubtitleFetchOptions = {}
): Promise<Subtitle> {
  const dep = await checkYtDlp()
  if (!dep.available) {
    throw new MotosanError('DEPENDENCY_MISSING', `yt-dlp is required. ${dep.installHint}`, { url })
  }

  const info = identifyPlatform(url)
  const lang = opts.lang ?? 'zh-TW'
  const tempDir = tmpdir()
  const tempId = randomUUID()
  const tempBase = join(tempDir, `mtk-sub-${tempId}`)

  try {
    // Try yt-dlp subtitles
    const args = [
      '--write-subs', '--write-auto-subs',
      '--skip-download',
      '--sub-format', 'vtt',
      '--sub-langs', lang,
      '--output', tempBase,
      url,
    ]

    try {
      await exec('yt-dlp', args)
    } catch {
      log.debug('yt-dlp subtitle fetch failed')
    }

    // Check for downloaded files
    const dir = dirname(tempBase)
    const prefix = basename(tempBase)
    const files = await readdir(dir)
    const vttFiles = files.filter(f => f.startsWith(prefix) && f.endsWith('.vtt'))

    for (const vttFile of vttFiles) {
      const content = await readFile(join(dir, vttFile), 'utf-8')
      const segments = parseVtt(content)
      if (segments.length > 0) {
        const isAuto = vttFile.includes('.auto.') || vttFile.includes('auto-generated')
        return {
          url, lang, source: isAuto ? 'auto' : 'official',
          provider: info.platform, segments, fetchedAt: new Date().toISOString(),
        }
      }
    }

    // Whisper fallback
    if (opts.fallbackWhisper) {
      log.info('No subtitles found, falling back to Whisper')
      const segments = await transcribe(url, lang)
      return {
        url, lang, source: 'whisper',
        provider: info.platform, segments, fetchedAt: new Date().toISOString(),
      }
    }

    throw new MotosanError('NOT_FOUND', `No subtitles found for ${url}`, { url, provider: info.platform })
  } finally {
    const dir = dirname(tempBase)
    const prefix = basename(tempBase)
    const files = await readdir(dir).catch(() => [] as string[])
    for (const file of files) {
      if (file.startsWith(prefix)) await unlink(join(dir, file)).catch(() => {})
    }
  }
}
