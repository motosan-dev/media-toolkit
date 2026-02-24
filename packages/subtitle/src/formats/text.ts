import type { Subtitle } from '../types.js'

/**
 * Convert subtitle to plain text (one line per segment, no timestamps).
 */
export function toText(subtitle: Subtitle): string {
  return subtitle.segments.map(seg => seg.text).join('\n')
}
