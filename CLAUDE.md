# CLAUDE.md — media-toolkit

## Project Overview

Agent-friendly media toolkit monorepo — subtitle, download, audio extraction & metadata APIs designed for AI agents, MCP servers, and CLI pipelines.

## Repository Structure

```
media-toolkit/
├── packages/
│   ├── core/        — @motosan-dev/core       (shared types, platform registry, error handling)
│   ├── subtitle/    — @motosan-dev/subtitle    (subtitle fetching, Whisper fallback, format conversion)
│   ├── downloader/  — @motosan-dev/downloader  (video download via yt-dlp)
│   ├── audio/       — @motosan-dev/audio       (audio extraction via yt-dlp + ffmpeg)
│   ├── metadata/    — @motosan-dev/metadata    (video metadata via yt-dlp --dump-json)
│   └── cli/         — @motosan-dev/cli         (unified CLI: `mtk`)
```

## Key Commands

```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages (tsup, ESM + DTS)
pnpm test             # Run all tests (vitest)
pnpm clean            # Remove all dist/ folders
```

## Architecture Principles

- **Agent-friendly**: stdout = structured data (JSON), stderr = logs. Safe to pipe.
- **Provider pattern**: Each platform (YouTube, Bilibili, TikTok, Twitter, Podcast, Local) is a pluggable provider.
- **URL routing**: `identifyPlatform(url)` in `@motosan-dev/core` routes URLs to the correct provider.
- **External deps**: yt-dlp, ffmpeg, whisper/faster-whisper are system-installed, not bundled. Checked at runtime via `checkAllDeps()`.
- **Structured errors**: `MotosanError` with error codes (NOT_FOUND, UNSUPPORTED, RATE_LIMITED, etc.) and `.toJSON()`.

## Package Dependencies

```
cli → subtitle, downloader, audio, metadata → core
```

## Tech Stack

- **Runtime**: Node.js ≥ 20
- **Package Manager**: pnpm 9 (workspace)
- **Build**: tsup (ESM output + DTS)
- **Test**: vitest
- **CLI**: commander
- **Versioning**: changesets
- **Language**: TypeScript (ES2022, ESNext modules, bundler resolution)

## Adding a New Platform Provider

1. Add URL patterns in `packages/core/src/platforms/<name>.ts`
2. Register in `packages/core/src/platforms/index.ts`
3. Add provider logic in the relevant feature package (subtitle/downloader/etc.)

## Adding a New Feature Package

1. Create `packages/<name>/` with `package.json`, `tsconfig.json`, `src/index.ts`
2. Add to `pnpm-workspace.yaml` (auto-detected via `packages/*`)
3. Wire into CLI at `packages/cli/src/commands/<name>.ts`
