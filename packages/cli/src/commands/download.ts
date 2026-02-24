import { Command } from 'commander'
import { downloadVideo } from '@motosan-dev/downloader'
import type { VideoQuality } from '@motosan-dev/downloader'

export const downloadCommand = new Command('download')
  .description('Download a video from URL')
  .argument('<url>', 'Video URL')
  .option('-q, --quality <quality>', 'Video quality: best, 1080p, 720p, 480p, 360p, worst', 'best')
  .option('-o, --output <dir>', 'Output directory', process.cwd())
  .option('--filename <name>', 'Output filename template')
  .action(async (url: string, opts) => {
    const result = await downloadVideo(url, {
      quality: opts.quality as VideoQuality,
      outputDir: opts.output,
      filename: opts.filename,
    })
    process.stdout.write(JSON.stringify(result, null, 2))
    process.stdout.write('\n')
  })
