import type { Subtitle } from '../types.js'

/**
 * Convert subtitle to SRT format.
 */
export function toSrt(subtitle: Subtitle): string {
  return subtitle.segments
    .map((seg, i) => {
      const start = formatSrtTime(seg.start)
      const end = formatSrtTime(seg.end)
      return `${i + 1}\n${start} --> ${end}\n${seg.text}`
    })
    .join('\n\n')
}

function formatSrtTime(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const mil = ms % 1000
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(mil, 3)}`
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}
