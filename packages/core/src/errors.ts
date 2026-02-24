import type { ErrorCode, PlatformName } from './types.js'

/**
 * Base error class for all media-toolkit errors.
 * Provides structured error information for agent-friendly error handling.
 */
export class MotosanError extends Error {
  readonly code: ErrorCode
  readonly url?: string
  readonly provider?: PlatformName

  constructor(
    code: ErrorCode,
    message: string,
    options?: { url?: string; provider?: PlatformName; cause?: Error }
  ) {
    super(message, { cause: options?.cause })
    this.name = 'MotosanError'
    this.code = code
    this.url = options?.url
    this.provider = options?.provider
  }

  /**
   * Serialize to a JSON-friendly object for agent consumption.
   */
  toJSON() {
    return {
      error: true,
      code: this.code,
      message: this.message,
      url: this.url,
      provider: this.provider,
    }
  }
}
