// Types
export type {
  PlatformName,
  MediaInfo,
  BaseProvider,
  ErrorCode,
  Logger,
} from './types.js'

// Errors
export { MotosanError } from './errors.js'

// Platforms
export { PLATFORMS, identifyPlatform } from './platforms/index.js'
export type { Platform } from './platforms/index.js'

// Utils
export { exec } from './utils/exec.js'
export type { ExecResult } from './utils/exec.js'
export {
  checkYtDlp,
  checkFfmpeg,
  checkWhisper,
  checkAllDeps,
} from './utils/deps.js'
export type { DependencyStatus } from './utils/deps.js'

// Logger
export { createLogger } from './logger.js'
