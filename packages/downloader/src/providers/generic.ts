import { exec, createLogger, identifyPlatform, checkYtDlp, MotosanError } from '@motosan-dev/core'
import type { DownloadOptions, DownloadResult } from '../types.js'
import { resolve } from 'node:path'
import { stat } from 'node:fs/promises'

const log = createLogger('downloader:generic')

/**
 * Generic video downloader using yt-dlp.
 * Works for TikTok, Twitter, Bilibili, and other yt-dlp supported platforms.
 */
export async function downloadGeneric(
  url: string,
  opts: DownloadOptions = {}
): Promise<DownloadResult> {
  const dep = await checkYtDlp()
  if (!dep.available) {
    throw new MotosanError('DEPENDENCY_MISSING', `yt-dlp is required. ${dep.installHint}`, { url })
  }

  const info = identifyPlatform(url)
  const outputDir = opts.outputDir ?? process.cwd()
  const format = opts.format ?? 'mp4'

  const args: string[] = [
    '--merge-output-format', format,
    '-o', resolve(outputDir, opts.filename ?? '%(title)s.%(ext)s'),
    '--print', 'after_move:filepath',
    url,
  ]

  if (opts.audioOnly) {
    args.splice(0, args.length,
      '-x', '--audio-format', 'mp3',
      '-o', resolve(outputDir, opts.filename ?? '%(title)s.%(ext)s'),
      '--print', 'after_move:filepath',
      url,
    )
  }

  log.info(`Downloading ${url} via generic provider`)

  try {
    const { stdout } = await exec('yt-dlp', args, { timeout: 600_000 })
    const filePath = stdout.trim().split('\n').pop() ?? ''

    let fileSize: number | undefined
    try {
      const stats = await stat(filePath)
      fileSize = stats.size
    } catch { /* ignore */ }

    return {
      url, provider: info.platform, filePath, fileSize,
      downloadedAt: new Date().toISOString(),
    }
  } catch (err) {
    throw new MotosanError('NETWORK_ERROR', `Download failed: ${(err as Error).message}`, { url, provider: info.platform, cause: err as Error })
  }
}
