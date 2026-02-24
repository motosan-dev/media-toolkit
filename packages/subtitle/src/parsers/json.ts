import type { Segment } from '../types.js'

/**
 * Parse Bilibili-style JSON subtitle format.
 * Bilibili returns { body: [{ from, to, content }] }
 */
export function parseBilibiliJson(data: { body: Array<{ from: number; to: number; content: string }> }): Segment[] {
  if (!data?.body || !Array.isArray(data.body)) return []

  return data.body
    .filter(item => item.content?.trim())
    .map(item => ({
      start: Math.round(item.from * 1000),
      end: Math.round(item.to * 1000),
      text: item.content.trim(),
    }))
}
