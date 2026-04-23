import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ConfigManager } from '../src/config/config-manager';

describe('ConfigManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CONFIG_JSON_PATH;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('loads defaults from environment', () => {
    process.env.DETECTION_INTERVAL_MS = '1500';
    process.env.WEBHOOK_ENABLED = 'true';
    process.env.WEBHOOK_URL = 'https://example.com/hook';

    const config = ConfigManager.load();

    expect(config.detectionIntervalMs).toBe(1500);
    expect(config.webhook.enabled).toBe(true);
    expect(config.webhook.url).toBe('https://example.com/hook');
  });

  it('merges JSON config over environment defaults', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'screen-detector-'));
    const file = path.join(dir, 'config.json');

    fs.writeFileSync(
      file,
      JSON.stringify({
        detectionIntervalMs: 999,
        actions: { blur: true },
        webhook: { retryCount: 7 },
      }),
    );

    process.env.CONFIG_JSON_PATH = file;
    const config = ConfigManager.load();

    expect(config.detectionIntervalMs).toBe(999);
    expect(config.actions.blur).toBe(true);
    expect(config.webhook.retryCount).toBe(7);
  });
});
