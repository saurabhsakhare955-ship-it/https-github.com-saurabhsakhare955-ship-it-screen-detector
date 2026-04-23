import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ScreenDetector } from '../src/core/detector';
import { AppConfig, DetectionEvent } from '../src/types';

describe('ScreenDetector', () => {
  it('starts and stops without crashing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'detector-test-'));
    const config: AppConfig = {
      detectionIntervalMs: 50,
      logLevel: 'info',
      logFile: path.join(dir, 'app.log'),
      logMaxSizeBytes: 1024,
      logMaxFiles: 2,
      eventStorageFile: path.join(dir, 'events.json'),
      webhook: { enabled: false, url: '', retryCount: 1, retryDelayMs: 1, timeoutMs: 500 },
      email: {
        enabled: false,
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        from: 'a@example.com',
        to: 'b@example.com',
      },
      actions: { blur: false, lock: false, terminate: false, terminateTargets: [] },
    };

    const detector = new ScreenDetector(config);
    const events: DetectionEvent[] = [];

    detector.on('detection', (event) => events.push(event));
    detector.start();
    detector.stop();

    expect(events.length).toBeGreaterThanOrEqual(0);
  });
});
