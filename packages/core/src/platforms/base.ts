import type { PlatformName, MediaInfo } from '../types.js'

/**
 * Platform interface for URL identification.
 * Each supported platform implements this to detect and parse URLs.
 */
export interface Platform {
  name: PlatformName
  /** Test if the URL belongs to this platform */
  canHandle(url: string): boolean
  /** Extract media info from the URL */
  parseUrl(url: string): MediaInfo
}
