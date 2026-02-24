import type { PlatformName } from '@motosan-dev/core'

export type VideoQuality = 'best' | '2160p' | '1080p' | '720p' | '480p' | '360p' | 'worst'

export interface DownloadOptions {
  quality?: VideoQuality
  outputDir?: string
  filename?: string
  format?: 'mp4' | 'mkv' | 'webm'
  audioOnly?: boolean
}

export interface DownloadResult {
  url: string
  provider: PlatformName
  filePath: string
  fileSize?: number
  duration?: number
  quality?: string
  downloadedAt: string
}
