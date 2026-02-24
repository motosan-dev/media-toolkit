import { Command } from 'commander'
import { fetchSubtitle, formatSubtitle } from '@motosan-dev/subtitle'

export const subtitleCommand = new Command('subtitle')
  .description('Fetch subtitles from a video URL')
  .argument('<url>', 'Video URL')
  .option('-l, --lang <lang>', 'Subtitle language code', 'en')
  .option('-f, --format <format>', 'Output format: json, srt, vtt, text', 'json')
  .option('--fallback-whisper', 'Use Whisper as fallback for transcription')
  .action(async (url: string, opts) => {
    const format = opts.format as 'json' | 'srt' | 'vtt' | 'text'
    const result = await fetchSubtitle(url, {
      lang: opts.lang,
      fallbackWhisper: opts.fallbackWhisper ?? false,
    })

    if (format === 'json') {
      process.stdout.write(JSON.stringify(result, null, 2))
    } else {
      process.stdout.write(formatSubtitle(result, format))
    }
    process.stdout.write('\n')
  })
