import { exec, createLogger, checkYtDlp, MotosanError } from '@motosan-dev/core'
import type { DownloadOptions, DownloadResult } from '../types.js'
import { resolve } from 'node:path'
import { stat } from 'node:fs/promises'

const log = createLogger('downloader:youtube')

const QUALITY_MAP: Record<string, string> = {
  best: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
  '2160p': 'bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160]',
  '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]',
  '720p': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]',
  '480p': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]',
  '360p': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]',
  worst: 'worstvideo+worstaudio/worst',
}

export async function downloadYouTube(
  url: string,
  opts: DownloadOptions = {}
): Promise<DownloadResult> {
  const dep = await checkYtDlp()
  if (!dep.available) {
    throw new MotosanError('DEPENDENCY_MISSING', `yt-dlp is required. ${dep.installHint}`, { url, provider: 'youtube' })
  }

  const outputDir = opts.outputDir ?? process.cwd()
  const quality = opts.quality ?? 'best'
  const format = opts.format ?? 'mp4'

  const args: string[] = [
    '-f', QUALITY_MAP[quality] ?? QUALITY_MAP.best,
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

  log.info(`Downloading ${url} (quality: ${quality})`)

  try {
    const { stdout } = await exec('yt-dlp', args, { timeout: 600_000 })
    const filePath = stdout.trim().split('\n').pop() ?? ''

    let fileSize: number | undefined
    try {
      const stats = await stat(filePath)
      fileSize = stats.size
    } catch { /* ignore */ }

    return {
      url, provider: 'youtube', filePath, fileSize,
      downloadedAt: new Date().toISOString(),
    }
  } catch (err) {
    throw new MotosanError('NETWORK_ERROR', `Download failed: ${(err as Error).message}`, { url, provider: 'youtube', cause: err as Error })
  }
}
