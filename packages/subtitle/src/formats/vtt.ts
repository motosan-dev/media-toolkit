import type { Subtitle } from '../types.js'

/**
 * Convert subtitle to WebVTT format.
 */
export function toVtt(subtitle: Subtitle): string {
  const header = 'WEBVTT\n\n'
  const body = subtitle.segments
    .map((seg, i) => {
      const start = formatVttTime(seg.start)
      const end = formatVttTime(seg.end)
      return `${i + 1}\n${start} --> ${end}\n${seg.text}`
    })
    .join('\n\n')
  return header + body
}

function formatVttTime(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const mil = ms % 1000
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(mil, 3)}`
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}
