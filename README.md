# Screen Detector

Cross-platform screenshot and screen recording detection project for Windows, macOS, Linux, and a Manifest V3 browser extension.

## Features

- Real-time detection loop with `EventEmitter`
- Windows/macOS/Linux platform detectors with screenshot shortcut and clipboard/file/process heuristics
- Detection of common tools: ShareX, Snagit, OBS, ScreenFlow, Camtasia
- Rotating file logger
- JSON event storage
- Webhook notifications with retry/backoff
- Email notifications using nodemailer
- Response actions: blur/lock/terminate
- Config via `.env` and optional JSON config file
- Chrome/Edge extension (MV3) with popup, logs, settings, and background service worker
- Jest test suite with coverage thresholds
- ESLint/Prettier and GitHub Actions CI

## Quick Start

```bash
npm install
cp .env.example .env
npm run build
npm start
```

## Commands

```bash
npm run build
npm start
npm run dev
npm test
npm run lint
npm run format
```

## Configuration

1. Copy `.env.example` to `.env`.
2. Set webhook/email/action values.
3. Optional: set `CONFIG_JSON_PATH` to override values from JSON.

## Browser Extension

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `src/browser`.

## Event Format

```json
{
  "id": "1710000000000-abcd1234",
  "kind": "screenshot",
  "platform": "linux",
  "source": "clipboard_monitor",
  "detail": "Clipboard image content detected",
  "tool": "obs",
  "timestamp": "2026-04-23T00:00:00.000Z"
}
```

## Notes

- OS-level key capture APIs differ by platform and permissions; this project implements safe production heuristics that run without privileged native bindings.
- For stricter native interception, add platform-native modules and wire them into `src/native/*-detector.ts`.
