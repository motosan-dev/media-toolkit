import type { PlatformName } from '@motosan-dev/core'

/** A single timed text segment */
export interface Segment {
  start: number  // milliseconds
  end: number    // milliseconds
  text: string
}

/** Subtitle source classification */
export type SubtitleSource = 'official' | 'auto' | 'whisper'

/** Complete subtitle for a video */
export interface Subtitle {
  url: string
  lang: string            // BCP 47: 'zh-TW', 'en', 'ja'
  source: SubtitleSource
  provider: PlatformName
  segments: Segment[]
  fetchedAt: string       // ISO 8601
}

/** Available language info */
export interface SubtitleLang {
  code: string
  name?: string
  source: SubtitleSource
}

/** Subtitle fetch options */
export interface SubtitleFetchOptions {
  lang?: string             // preferred language, default: 'zh-TW'
  preferAuto?: boolean      // accept auto-generated, default: false
  fallbackWhisper?: boolean // use Whisper when no subtitle found, default: false
  format?: 'json' | 'srt' | 'vtt' | 'text'
}
