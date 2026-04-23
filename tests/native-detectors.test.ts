import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execCommand } from '../src/utils/exec';
import { LinuxDetector } from '../src/native/linux-detector';
import { MacOSDetector } from '../src/native/macos-detector';
import { WindowsDetector } from '../src/native/windows-detector';

jest.mock('../src/utils/exec', () => ({
  execCommand: jest.fn(async () => ''),
}));

const mockedExec = execCommand as jest.MockedFunction<typeof execCommand>;

function createScreenshotFile(baseDir: string, folder: string, fileName: string): void {
  const dir = path.join(baseDir, folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, fileName), 'x');
}

describe('Native detectors', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'native-detectors-'));
  let homedirSpy: jest.SpyInstance;

  beforeAll(() => {
    homedirSpy = jest.spyOn(os, 'homedir').mockReturnValue(tmp);
  });

  afterAll(() => {
    homedirSpy.mockRestore();
  });

  beforeEach(() => {
    mockedExec.mockReset();
  });

  it('detects linux screenshot and clipboard image', async () => {
    createScreenshotFile(tmp, 'Pictures', 'Screenshot from test.png');
    mockedExec.mockResolvedValueOnce('obs').mockResolvedValueOnce('image/png').mockResolvedValueOnce('');

    const detector = new LinuxDetector();
    const events = await detector.poll();

    expect(events.some((e) => e.kind === 'screenshot')).toBe(true);
    expect(events.some((e) => e.tool === 'obs')).toBe(true);
  });

  it('detects mac screenshot process and clipboard signature', async () => {
    createScreenshotFile(tmp, 'Desktop', 'Screen Shot 2026-04-23 at 10.00.00 AM.png');
    mockedExec
      .mockResolvedValueOnce('screenflow')
      .mockResolvedValueOnce('PNG')
      .mockResolvedValueOnce('123');

    const detector = new MacOSDetector();
    const events = await detector.poll();

    expect(events.filter((e) => e.kind === 'screenshot').length).toBeGreaterThan(0);
    expect(events.some((e) => e.tool === 'screenflow')).toBe(true);
  });

  it('detects windows screenshot and clipboard image', async () => {
    createScreenshotFile(tmp, path.join('Pictures', 'Screenshots'), 'Screenshot (1).png');
    mockedExec.mockResolvedValueOnce('sharex').mockResolvedValueOnce('1');

    const detector = new WindowsDetector();
    const events = await detector.poll();

    expect(events.some((e) => e.kind === 'screenshot')).toBe(true);
    expect(events.some((e) => e.tool === 'sharex')).toBe(true);
  });
});
