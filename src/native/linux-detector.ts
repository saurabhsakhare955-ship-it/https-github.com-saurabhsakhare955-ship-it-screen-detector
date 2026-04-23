import os from 'node:os';
import path from 'node:path';
import { BaseDetector } from './base-detector';
import { DetectionEvent } from '../types';
import { execCommand } from '../utils/exec';

export class LinuxDetector extends BaseDetector {
  constructor() {
    super('linux');
  }

  async poll(): Promise<DetectionEvent[]> {
    const home = os.homedir();
    const dirs = [path.join(home, 'Pictures'), path.join(home, 'Desktop')];
    const events = this.scanRecentFiles(dirs, [/screenshot/i, /screen.*shot/i, /flameshot/i]);

    events.push(...(await this.detectRunningTools('ps -ax -o command')));

    const x11Clipboard = await execCommand('xclip -selection clipboard -t TARGETS -o 2>/dev/null');
    const waylandClipboard = await execCommand('wl-paste --list-types 2>/dev/null');

    if (/image\//i.test(x11Clipboard) || /image\//i.test(waylandClipboard)) {
      events.push(
        this.buildEvent(
          'screenshot',
          'clipboard_monitor',
          'Clipboard image content detected (X11/Wayland screenshot heuristic)',
        ),
      );
    }

    return events;
  }
}
