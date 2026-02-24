import { exec, createLogger, identifyPlatform, checkYtDlp, checkFfmpeg, MotosanError } from '@motosan-dev/core'
import type { PlatformName } from '@motosan-dev/core'
import type { AudioOptions, AudioResult, AudioFormat } from './types.js'
import { resolve } from 'node:path'
import { stat } from 'node:fs/promises'

const log = createLogger('audio')

/**
 * Extract audio from a video URL or local file.
 * Uses yt-dlp for remote URLs and ffmpeg for local files.
 */
export async function extractAudio(
  url: string,
  opts: AudioOptions = {}
): Promise<AudioResult> {
  const format: AudioFormat = opts.format ?? 'mp3'
  const outputDir = opts.outputDir ?? process.cwd()

  // Check if it's a local file
  if (url.startsWith('file://') || url.startsWith('/')) {
    return extractFromLocal(url, format, outputDir, opts)
  }

  return extractFromUrl(url, format, outputDir, opts)
}

async function extractFromUrl(
  url: string,
  format: AudioFormat,
  outputDir: string,
  opts: AudioOptions
): Promise<AudioResult> {
  const dep = await checkYtDlp()
  if (!dep.available) {
    throw new MotosanError('DEPENDENCY_MISSING', `yt-dlp is required. ${dep.installHint}`, { url })
  }

  let platform: PlatformName
  try {
    const info = identifyPlatform(url)
    platform = info.platform
  } catch {
    throw new MotosanError('UNSUPPORTED', `Unsupported URL: ${url}`, { url })
  }

  const outputTemplate = resolve(outputDir, opts.filename ?? '%(title)s.%(ext)s')

  const args: string[] = [
    '-x',
    '--audio-format', format,
    '-o', outputTemplate,
    '--print', 'after_move:filepath',
    url,
  ]

  if (opts.bitrate) {
    args.push('--audio-quality', opts.bitrate)
  }

  log.info(`Extracting audio from ${url} (format: ${format})`)

  try {
    const { stdout } = await exec('yt-dlp', args, { timeout: 600_000 })
    const filePath = stdout.trim().split('\n').pop() ?? ''

    let fileSize: number | undefined
    try {
      const stats = await stat(filePath)
      fileSize = stats.size
    } catch { /* ignore */ }

    return {
      url, provider: platform, filePath, format, fileSize,
      extractedAt: new Date().toISOString(),
    }
  } catch (err) {
    throw new MotosanError('NETWORK_ERROR', `Audio extraction failed: ${(err as Error).message}`, { url, provider: platform, cause: err as Error })
  }
}

async function extractFromLocal(
  filePath: string,
  format: AudioFormat,
  outputDir: string,
  opts: AudioOptions
): Promise<AudioResult> {
  const dep = await checkFfmpeg()
  if (!dep.available) {
    throw new MotosanError('DEPENDENCY_MISSING', `ffmpeg is required. ${dep.installHint}`, { url: filePath })
  }

  const inputPath = filePath.replace('file://', '')
  const { basename, extname } = await import('node:path')
  const baseName = opts.filename ?? `${basename(inputPath, extname(inputPath))}.${format}`
  const outputPath = resolve(outputDir, baseName)

  const args: string[] = [
    '-i', inputPath,
    '-vn', // No video
    '-y',  // Overwrite
  ]

  if (opts.bitrate) {
    args.push('-b:a', opts.bitrate)
  }

  args.push(outputPath)

  log.info(`Extracting audio from local file: ${inputPath}`)

  try {
    await exec('ffmpeg', args, { timeout: 600_000 })

    let fileSize: number | undefined
    try {
      const stats = await stat(outputPath)
      fileSize = stats.size
    } catch { /* ignore */ }

    return {
      url: filePath, provider: 'local', filePath: outputPath, format, fileSize,
      extractedAt: new Date().toISOString(),
    }
  } catch (err) {
    throw new MotosanError('PARSE_ERROR', `ffmpeg extraction failed: ${(err as Error).message}`, { url: filePath, cause: err as Error })
  }
}
