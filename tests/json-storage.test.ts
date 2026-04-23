import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { JsonStorage } from '../src/storage/json-storage';
import { DetectionEvent } from '../src/types';

describe('JsonStorage', () => {
  it('appends and reads events', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-test-'));
    const file = path.join(dir, 'events.json');
    const storage = new JsonStorage(file);

    const event: DetectionEvent = {
      id: '1',
      kind: 'screenshot',
      platform: 'linux',
      source: 'test',
      detail: 'example',
      timestamp: new Date().toISOString(),
    };

    storage.append(event);
    const all = storage.readAll();

    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('1');
  });
});
