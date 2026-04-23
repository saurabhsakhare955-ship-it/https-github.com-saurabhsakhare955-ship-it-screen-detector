import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execCommand } from '../src/utils/exec';
import { RotatingLogger } from '../src/utils/logger';

describe('Logger and exec utilities', () => {
  it('rotates logs when max size is exceeded', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-test-'));
    const file = path.join(dir, 'app.log');
    const logger = new RotatingLogger(file, 20, 2);

    logger.log('info', 'first-line');
    logger.log('info', 'second-line-overflow');

    const files = fs.readdirSync(dir);
    expect(files.some((name) => name.startsWith('app.log.'))).toBe(true);
  });

  it('executes commands and handles errors', async () => {
    const ok = await execCommand('echo hello');
    const fail = await execCommand('command-does-not-exist-xyz');

    expect(ok).toBe('hello');
    expect(fail).toBe('');
  });
});
