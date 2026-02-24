import type { Logger } from './types.js'

/**
 * Create a logger that outputs to stderr.
 * This keeps stdout clean for structured data output (agent-friendly).
 */
export function createLogger(prefix = 'mtk'): Logger {
  return {
    debug(message: string, ...args: unknown[]) {
      if (process.env.DEBUG) {
        console.error(`[${prefix}:debug] ${message}`, ...args)
      }
    },
    info(message: string, ...args: unknown[]) {
      console.error(`[${prefix}:info] ${message}`, ...args)
    },
    warn(message: string, ...args: unknown[]) {
      console.error(`[${prefix}:warn] ${message}`, ...args)
    },
    error(message: string, ...args: unknown[]) {
      console.error(`[${prefix}:error] ${message}`, ...args)
    },
  }
}
