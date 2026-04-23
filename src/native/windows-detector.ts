import os from 'node:os';
import path from 'node:path';
import { BaseDetector } from './base-detector';
import { DetectionEvent } from '../types';
import { execCommand } from '../utils/exec';

export class WindowsDetector extends BaseDetector {
  constructor() {
    super('win32');
  }

  async poll(): Promise<DetectionEvent[]> {
    const home = os.homedir();
    const screenshotDirs = [
      path.join(home, 'Pictures', 'Screenshots'),
      path.join(home, 'Desktop'),
    ];

    const events = this.scanRecentFiles(screenshotDirs, [/screenshot/i, /snip/i, /capture/i]);
    events.push(...(await this.detectRunningTools('tasklist')));

    const hasClipboardImage = await execCommand(
      'powershell -NoProfile -Command "if (Get-Clipboard -Format Image -ErrorAction SilentlyContinue) { Write-Output 1 }"',
    );

    if (hasClipboardImage === '1') {
      events.push(
        this.buildEvent(
          'screenshot',
          'keyboard_hook',
          'Clipboard image detected (likely PrintScreen/Win+Shift+S/Alt+PrintScreen)',
        ),
      );
    }

    return events;
  }
}
