import { AppConfig } from '../types';
import { execCommand } from '../utils/exec';

export class ActionHandler {
  constructor(private readonly actions: AppConfig['actions']) {}

  async run(): Promise<void> {
    if (this.actions.blur) {
      await this.blurScreen();
    }

    if (this.actions.lock) {
      await this.lockScreen();
    }

    if (this.actions.terminate && this.actions.terminateTargets.length > 0) {
      await this.terminateTargets();
    }
  }

  private async blurScreen(): Promise<void> {
    if (process.platform === 'darwin') {
      await execCommand('open -a "ScreenSaverEngine"');
      return;
    }

    if (process.platform === 'linux') {
      await execCommand('xdg-screensaver activate');
      return;
    }

    if (process.platform === 'win32') {
      await execCommand('rundll32.exe user32.dll,LockWorkStation');
    }
  }

  private async lockScreen(): Promise<void> {
    if (process.platform === 'darwin') {
      await execCommand('/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend');
      return;
    }

    if (process.platform === 'linux') {
      await execCommand('loginctl lock-session');
      return;
    }

    if (process.platform === 'win32') {
      await execCommand('rundll32.exe user32.dll,LockWorkStation');
    }
  }

  private async terminateTargets(): Promise<void> {
    for (const target of this.actions.terminateTargets) {
      const safeTarget = target.replace(/[^a-zA-Z0-9_.-]/g, '');
      if (!safeTarget) continue;

      if (process.platform === 'win32') {
        await execCommand(`taskkill /IM ${safeTarget} /F`);
      } else {
        await execCommand(`pkill -f ${safeTarget}`);
      }
    }
  }
}
