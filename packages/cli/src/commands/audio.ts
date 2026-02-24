import { Command } from 'commander'
import { extractAudio } from '@motosan-dev/audio'
import type { AudioFormat } from '@motosan-dev/audio'

export const audioCommand = new Command('audio')
  .description('Extract audio from a video URL or local file')
  .argument('<url>', 'Video URL or local file path')
  .option('-f, --format <format>', 'Audio format: mp3, wav, flac, aac, m4a, opus', 'mp3')
  .option('-o, --output <dir>', 'Output directory', process.cwd())
  .option('--bitrate <bitrate>', 'Audio bitrate (e.g., 192k, 320k)')
  .option('--filename <name>', 'Output filename')
  .action(async (url: string, opts) => {
    const result = await extractAudio(url, {
      format: opts.format as AudioFormat,
      outputDir: opts.output,
      bitrate: opts.bitrate,
      filename: opts.filename,
    })
    process.stdout.write(JSON.stringify(result, null, 2))
    process.stdout.write('\n')
  })
