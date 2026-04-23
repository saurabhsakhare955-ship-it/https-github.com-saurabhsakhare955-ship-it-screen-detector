import os from 'node:os';
import path from 'node:path';
import { BaseDetector } from './base-detector';
import { DetectionEvent } from '../types';
import { execCommand } from '../utils/exec';

export class MacOSDetector extends BaseDetector {
  constructor() {
    super('darwin');
  }

  async poll(): Promise<DetectionEvent[]> {
    const home = os.homedir();
    const screenshotDir = path.join(home, 'Desktop');
    const events = this.scanRecentFiles(screenshotDir ? [screenshotDir] : [], [/^screen shot/i, /^screenshot/i]);

    events.push(...(await this.detectRunningTools('ps -ax -o command')));

    const clipboardTypes = await execCommand('pbpaste -Prefer txt 2>/dev/null | head -c 50');
    if (clipboardTypes.includes('PNG') || clipboardTypes.includes('JFIF')) {
      events.push(
        this.buildEvent(
          'screenshot',
          'keyboard_listener',
          'Clipboard image signature detected (likely Cmd+Shift+3/4/5)',
        ),
      );
    }

    const screencaptureRunning = await execCommand('pgrep -f screencapture');
    if (screencaptureRunning) {
      events.push(
        this.buildEvent(
          'screenshot',
          'keyboard_listener',
          'screencapture process detected (Cmd+Shift+3/4/5)',
        ),
      );
    }

    return events;
  }
}
