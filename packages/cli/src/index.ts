#!/usr/bin/env node
import { Command } from 'commander'
import { subtitleCommand } from './commands/subtitle.js'
import { downloadCommand } from './commands/download.js'
import { audioCommand } from './commands/audio.js'
import { metadataCommand } from './commands/metadata.js'
import { infoCommand } from './commands/info.js'

const program = new Command()

program
  .name('mtk')
  .description('Agent-friendly media toolkit — subtitle, download, audio & metadata')
  .version('0.0.1')

program.addCommand(subtitleCommand)
program.addCommand(downloadCommand)
program.addCommand(audioCommand)
program.addCommand(metadataCommand)
program.addCommand(infoCommand)

program.parseAsync(process.argv).catch((err) => {
  console.error(JSON.stringify({ error: true, message: err.message }))
  process.exit(1)
})
