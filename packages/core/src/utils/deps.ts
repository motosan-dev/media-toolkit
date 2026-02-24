import { exec } from './exec.js'

export interface DependencyStatus {
  name: string
  available: boolean
  version?: string
  installHint: string
}

/**
 * Check if a system dependency is available.
 */
async function checkDep(
  name: string,
  versionFlag: string,
  installHint: string
): Promise<DependencyStatus> {
  try {
    const { stdout } = await exec(name, [versionFlag])
    const version = stdout.trim().split('\n')[0]
    return { name, available: true, version, installHint }
  } catch {
    return { name, available: false, installHint }
  }
}

/**
 * Check if yt-dlp is installed.
 */
export function checkYtDlp(): Promise<DependencyStatus> {
  return checkDep(
    'yt-dlp',
    '--version',
    'Install: brew install yt-dlp (macOS) | pip install yt-dlp (Python)'
  )
}

/**
 * Check if ffmpeg is installed.
 */
export function checkFfmpeg(): Promise<DependencyStatus> {
  return checkDep(
    'ffmpeg',
    '-version',
    'Install: brew install ffmpeg (macOS) | apt install ffmpeg (Ubuntu)'
  )
}

/**
 * Check if whisper (or faster-whisper) is installed.
 */
export async function checkWhisper(): Promise<DependencyStatus> {
  // Try faster-whisper first (4x faster)
  const fasterWhisper = await checkDep(
    'faster-whisper',
    '--help',
    'Install: pip install faster-whisper'
  )
  if (fasterWhisper.available) return fasterWhisper

  return checkDep(
    'whisper',
    '--help',
    'Install: pip install openai-whisper (or faster-whisper for 4x speed)'
  )
}

/**
 * Check all system dependencies and return their status.
 */
export async function checkAllDeps(): Promise<DependencyStatus[]> {
  return Promise.all([checkYtDlp(), checkFfmpeg(), checkWhisper()])
}
