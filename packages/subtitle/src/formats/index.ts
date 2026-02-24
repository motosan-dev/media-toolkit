import type { Subtitle } from '../types.js'
import { toSrt } from './srt.js'
import { toVtt } from './vtt.js'
import { toText } from './text.js'

export { toSrt, toVtt, toText }

/**
 * Format a subtitle to the requested output format.
 */
export function formatSubtitle(
  subtitle: Subtitle,
  format: 'json' | 'srt' | 'vtt' | 'text' = 'json'
): string {
  switch (format) {
    case 'srt':
      return toSrt(subtitle)
    case 'vtt':
      return toVtt(subtitle)
    case 'text':
      return toText(subtitle)
    case 'json':
    default:
      return JSON.stringify(subtitle, null, 2)
  }
}
