import { Command } from 'commander'
import { identifyPlatform, checkAllDeps } from '@motosan-dev/core'
import { fetchMetadata } from '@motosan-dev/metadata'

export const infoCommand = new Command('info')
  .description('Show video information summary or system dependency status')
  .argument('[url]', 'Video URL (omit to show dependency status)')
  .action(async (url?: string) => {
    if (!url) {
      // Show dependency status
      const deps = await checkAllDeps()
      const result = {
        dependencies: deps.map((d) => ({
          name: d.name,
          available: d.available,
          version: d.version ?? null,
          installHint: d.available ? null : d.installHint,
        })),
      }
      process.stdout.write(JSON.stringify(result, null, 2))
      process.stdout.write('\n')
      return
    }

    const platform = identifyPlatform(url)
    const metadata = await fetchMetadata(url).catch(() => null)

    const result = {
      url,
      platform: platform.platform,
      videoId: platform.videoId ?? null,
      metadata: metadata
        ? {
            title: metadata.title,
            uploader: metadata.uploader,
            duration: metadata.duration,
            viewCount: metadata.viewCount,
            uploadDate: metadata.uploadDate,
            thumbnail: metadata.thumbnail,
          }
        : null,
    }

    process.stdout.write(JSON.stringify(result, null, 2))
    process.stdout.write('\n')
  })
