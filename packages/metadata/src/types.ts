import type { PlatformName } from '@motosan-dev/core'

export interface VideoMetadata {
  url: string
  provider: PlatformName
  title: string
  description?: string
  thumbnail?: string
  duration?: number        // seconds
  viewCount?: number
  likeCount?: number
  uploadDate?: string      // ISO 8601
  uploader?: string
  uploaderUrl?: string
  tags?: string[]
  categories?: string[]
  language?: string
  fetchedAt: string        // ISO 8601
  raw?: Record<string, unknown>  // full raw data from provider
}

export interface MetadataOptions {
  includeRaw?: boolean     // include full raw data in response
}
