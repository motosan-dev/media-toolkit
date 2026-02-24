import { Command } from 'commander'
import { fetchMetadata } from '@motosan-dev/metadata'

export const metadataCommand = new Command('metadata')
  .description('Fetch video metadata from URL')
  .argument('<url>', 'Video URL')
  .action(async (url: string) => {
    const result = await fetchMetadata(url)
    process.stdout.write(JSON.stringify(result, null, 2))
    process.stdout.write('\n')
  })
