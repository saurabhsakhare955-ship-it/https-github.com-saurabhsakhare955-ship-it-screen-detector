import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ScreenDetector } from '../src/core/detector';
import { AppConfig, DetectionEvent } from '../src/types';

describe('ScreenDetector integration behavior', () => {
  it('persists, emits, and calls handlers for detected events', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'detector-int-'));
    const config: AppConfig = {
      detectionIntervalMs: 100,
      logLevel: 'info',
      logFile: path.join(dir, 'detector.log'),
      logMaxSizeBytes: 1024,
      logMaxFiles: 2,
      eventStorageFile: path.join(dir, 'events.json'),
      webhook: { enabled: false, url: '', retryCount: 1, retryDelayMs: 1, timeoutMs: 100 },
      email: {
        enabled: false,
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        from: 'from@example.com',
        to: 'to@example.com',
      },
      actions: { blur: false, lock: false, terminate: false, terminateTargets: [] },
    };

    const detector = new ScreenDetector(config);
    const event: DetectionEvent = {
      id: 'id-1',
      kind: 'screenshot',
      platform: 'linux',
      source: 'test-source',
      detail: 'test-detail',
      timestamp: new Date().toISOString(),
    };

    const detected: DetectionEvent[] = [];
    detector.on('detection', (evt) => detected.push(evt));

    (detector as any).webhookNotifier = { notify: jest.fn(async () => false) };
    (detector as any).emailNotifier = { notify: jest.fn(async () => undefined) };
    (detector as any).actionHandler = { run: jest.fn(async () => undefined) };

    await (detector as any).handleDetection(event);

    const content = fs.readFileSync(config.eventStorageFile, 'utf-8');
    expect(content).toContain('id-1');
    expect(detected).toHaveLength(1);
    expect((detector as any).webhookNotifier.notify).toHaveBeenCalled();
    expect((detector as any).emailNotifier.notify).toHaveBeenCalled();
    expect((detector as any).actionHandler.run).toHaveBeenCalled();
  });
});
