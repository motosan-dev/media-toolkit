/**
 * Supported media platform identifiers.
 */
export type PlatformName =
  | 'youtube'
  | 'bilibili'
  | 'tiktok'
  | 'twitter'
  | 'podcast'
  | 'local'

/**
 * Information extracted from a media URL.
 */
export interface MediaInfo {
  url: string
  platform: PlatformName
  videoId?: string
}

/**
 * Base provider interface that all feature-specific providers extend.
 */
export interface BaseProvider<TOptions = unknown, TResult = unknown> {
  /** Provider name matching the platform */
  name: PlatformName
  /** Check if this provider can handle the given URL */
  canHandle(url: string): boolean
  /** Execute the provider's main function */
  execute(url: string, options?: TOptions): Promise<TResult>
}

/**
 * Error codes used across all packages.
 */
export type ErrorCode =
  | 'NOT_FOUND'
  | 'UNSUPPORTED'
  | 'RATE_LIMITED'
  | 'PARSE_ERROR'
  | 'NETWORK_ERROR'
  | 'DEPENDENCY_MISSING'
  | 'PERMISSION_ERROR'

/**
 * Logger interface for structured logging to stderr.
 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
}
