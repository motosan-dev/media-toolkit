# media-toolkit

> Agent-friendly media toolkit — subtitle, download, audio & metadata APIs designed for AI agents, MCP servers, and CLI pipelines.

[![CI](https://github.com/motosan-dev/media-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/motosan-dev/media-toolkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| `@motosan-dev/core` | Shared types, platform registry, error handling | — |
| `@motosan-dev/subtitle` | Subtitle fetching with Whisper fallback | — |
| `@motosan-dev/downloader` | Video download via yt-dlp | — |
| `@motosan-dev/audio` | Audio extraction (yt-dlp + ffmpeg) | — |
| `@motosan-dev/metadata` | Video metadata retrieval | — |
| `@motosan-dev/cli` | Unified CLI (`mtk`) | — |

## Quick Start

### CLI

```bash
npx @motosan-dev/cli subtitle https://youtube.com/watch?v=VIDEO_ID
npx @motosan-dev/cli download https://youtube.com/watch?v=VIDEO_ID
npx @motosan-dev/cli audio https://youtube.com/watch?v=VIDEO_ID --format wav
npx @motosan-dev/cli metadata https://youtube.com/watch?v=VIDEO_ID
npx @motosan-dev/cli info  # Show dependency status
```

### Programmatic

```typescript
import { fetchSubtitle } from '@motosan-dev/subtitle'
import { downloadVideo } from '@motosan-dev/downloader'
import { extractAudio } from '@motosan-dev/audio'
import { fetchMetadata } from '@motosan-dev/metadata'

// Fetch subtitles
const subtitle = await fetchSubtitle('https://youtube.com/watch?v=VIDEO_ID', {
  lang: 'en',
  format: 'srt',
})

// Download video
const video = await downloadVideo('https://youtube.com/watch?v=VIDEO_ID', {
  quality: '720p',
  outputDir: './videos',
})

// Extract audio
const audio = await extractAudio('https://youtube.com/watch?v=VIDEO_ID', {
  format: 'mp3',
  bitrate: '192k',
})

// Get metadata
const meta = await fetchMetadata('https://youtube.com/watch?v=VIDEO_ID')
```

## Supported Platforms

- YouTube (youtube.com, youtu.be, shorts, embed, live)
- Bilibili (bilibili.com, b23.tv)
- TikTok
- Twitter / X
- Podcast RSS feeds
- Local files

## System Dependencies

These tools must be installed on your system:

| Tool | Required By | Install |
|------|------------|---------|
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | subtitle, downloader, audio, metadata | `brew install yt-dlp` |
| [ffmpeg](https://ffmpeg.org/) | audio (local files) | `brew install ffmpeg` |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | subtitle (whisper fallback) | `pip install faster-whisper` |

Check status with `mtk info`.

## Development

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests
pnpm clean      # Clean build artifacts
```

## License

[MIT](LICENSE) © motosan-dev
