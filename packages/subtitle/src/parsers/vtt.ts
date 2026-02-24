import type { Segment } from '../types.js'

/**
 * Parse VTT (WebVTT) format into Segment array.
 * Handles deduplication of overlapping cue text.
 */
export function parseVtt(content: string): Segment[] {
  const lines = content.split('\n')
  const segments: Segment[] = []
  let i = 0

  // Skip header
  while (i < lines.length && !lines[i].includes('-->')) {
    i++
  }

  while (i < lines.length) {
    const line = lines[i].trim()
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->')
      const start = parseTimestamp(startStr.trim())
      const end = parseTimestamp(endStr.trim().split(' ')[0])
      i++

      const textLines: string[] = []
      while (i < lines.length && lines[i].trim() !== '') {
        // Strip VTT tags like <c>, </c>, <00:00:01.000>
        const cleaned = lines[i].trim().replace(/<[^>]+>/g, '')
        if (cleaned) textLines.push(cleaned)
        i++
      }

      const text = textLines.join(' ').trim()
      if (text) {
        // Deduplicate: skip if same text as previous segment
        if (segments.length === 0 || segments[segments.length - 1].text !== text) {
          segments.push({ start, end, text })
        } else {
          // Extend previous segment's end time
          segments[segments.length - 1].end = end
        }
      }
    } else {
      i++
    }
  }

  return segments
}

/** Parse VTT timestamp to milliseconds */
function parseTimestamp(ts: string): number {
  // Format: HH:MM:SS.mmm or MM:SS.mmm
  const parts = ts.split(':')
  let hours = 0, minutes = 0, seconds = 0

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10)
    minutes = parseInt(parts[1], 10)
    seconds = parseFloat(parts[2])
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10)
    seconds = parseFloat(parts[1])
  }

  return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000)
}
