import type { PlatformName } from '@motosan-dev/core'

export type AudioFormat = 'mp3' | 'wav' | 'flac' | 'aac' | 'm4a' | 'opus'

export interface AudioOptions {
  format?: AudioFormat
  bitrate?: string       // e.g., '192k', '320k'
  outputDir?: string
  filename?: string
}

export interface AudioResult {
  url: string
  provider: PlatformName | 'local'
  filePath: string
  format: AudioFormat
  fileSize?: number
  duration?: number
  extractedAt: string
}
