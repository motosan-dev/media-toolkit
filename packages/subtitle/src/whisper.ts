import { exec, createLogger, checkWhisper, MotosanError } from '@motosan-dev/core'
import type { Segment } from './types.js'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { readFile, unlink, readdir } from 'node:fs/promises'
import { dirname, basename } from 'node:path'

const log = createLogger('subtitle:whisper')

/**
 * Transcribe audio/video to subtitle segments using Whisper.
 * Prefers faster-whisper if available (4x faster).
 */
export async function transcribe(
  mediaUrl: string,
  lang?: string
): Promise<Segment[]> {
  const dep = await checkWhisper()
  if (!dep.available) {
    throw new MotosanError(
      'DEPENDENCY_MISSING',
      `Whisper is required for transcription. ${dep.installHint}`,
      { url: mediaUrl }
    )
  }

  const tempDir = tmpdir()
  const tempId = randomUUID()
  const outputPath = join(tempDir, `mtk-whisper-${tempId}`)

  log.info(`Transcribing with ${dep.name}: ${mediaUrl}`)

  try {
    const isFasterWhisper = dep.name === 'faster-whisper'
    const args = buildWhisperArgs(mediaUrl, outputPath, lang, isFasterWhisper)

    await exec(dep.name, args, { timeout: 600_000 }) // 10 min timeout

    // Read the generated SRT output
    const srtPath = `${outputPath}.srt`
    const content = await readFile(srtPath, 'utf-8')
    return parseSrtContent(content)
  } catch (err) {
    if (err instanceof MotosanError) throw err
    throw new MotosanError(
      'PARSE_ERROR',
      `Whisper transcription failed: ${(err as Error).message}`,
      { url: mediaUrl, cause: err as Error }
    )
  } finally {
    // Clean up temp files
    const dir = dirname(outputPath)
    const prefix = basename(outputPath)
    const files = await readdir(dir).catch(() => [] as string[])
    for (const f of files) {
      if (f.startsWith(prefix)) await unlink(join(dir, f)).catch(() => {})
    }
  }
}

function buildWhisperArgs(
  input: string,
  output: string,
  lang?: string,
  isFasterWhisper?: boolean
): string[] {
  const args: string[] = [input, '--output_format', 'srt', '--output_dir', join(output, '..')]
  if (lang) {
    args.push('--language', lang.split('-')[0]) // Whisper uses ISO 639-1
  }
  if (isFasterWhisper) {
    args.push('--model', 'base')
  }
  return args
}

function parseSrtContent(content: string): Segment[] {
  const segments: Segment[] = []
  const blocks = content.trim().split(/\n\n+/)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 3) continue

    const timeLine = lines[1]
    const match = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
    if (!match) continue

    const start = toMs(match[1], match[2], match[3], match[4])
    const end = toMs(match[5], match[6], match[7], match[8])
    const text = lines.slice(2).join(' ').trim()

    if (text) segments.push({ start, end, text })
  }

  return segments
}

function toMs(h: string, m: string, s: string, ms: string): number {
  return parseInt(h) * 3600000 + parseInt(m) * 60000 + parseInt(s) * 1000 + parseInt(ms)
}
