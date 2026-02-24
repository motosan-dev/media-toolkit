import { exec, createLogger, identifyPlatform, checkYtDlp, MotosanError } from '@motosan-dev/core'
import type { VideoMetadata, MetadataOptions } from '../types.js'

const log = createLogger('metadata:generic')

/**
 * Generic metadata fetcher using yt-dlp --dump-json.
 */
export async function fetchGenericMetadata(
  url: string,
  opts: MetadataOptions = {}
): Promise<VideoMetadata> {
  const dep = await checkYtDlp()
  if (!dep.available) {
    throw new MotosanError('DEPENDENCY_MISSING', `yt-dlp is required. ${dep.installHint}`, { url })
  }

  const info = identifyPlatform(url)
  log.info(`Fetching metadata for ${url} (${info.platform})`)

  try {
    const { stdout } = await exec('yt-dlp', ['--dump-json', '--skip-download', url])
    const data = JSON.parse(stdout) as Record<string, unknown>

    const metadata: VideoMetadata = {
      url,
      provider: info.platform,
      title: (data.title as string) ?? 'Unknown',
      description: data.description as string | undefined,
      thumbnail: data.thumbnail as string | undefined,
      duration: data.duration as number | undefined,
      viewCount: data.view_count as number | undefined,
      likeCount: data.like_count as number | undefined,
      uploadDate: data.upload_date as string | undefined,
      uploader: data.uploader as string | undefined,
      uploaderUrl: data.uploader_url as string | undefined,
      tags: data.tags as string[] | undefined,
      categories: data.categories as string[] | undefined,
      language: data.language as string | undefined,
      fetchedAt: new Date().toISOString(),
    }

    if (opts.includeRaw) metadata.raw = data
    return metadata
  } catch (err) {
    if (err instanceof MotosanError) throw err
    throw new MotosanError('NETWORK_ERROR', `Failed to fetch metadata: ${(err as Error).message}`, { url, provider: info.platform, cause: err as Error })
  }
}
