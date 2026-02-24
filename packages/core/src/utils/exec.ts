import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface ExecResult {
  stdout: string
  stderr: string
}

/**
 * Execute a shell command and return stdout/stderr.
 * All subprocess output goes to stderr to keep stdout clean for data.
 */
export async function exec(
  command: string,
  args: string[],
  options?: { cwd?: string; timeout?: number }
): Promise<ExecResult> {
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd: options?.cwd,
    timeout: options?.timeout ?? 120_000,
    maxBuffer: 50 * 1024 * 1024, // 50MB
  })
  return { stdout, stderr }
}
