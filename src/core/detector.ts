import { EventEmitter } from 'node:events';
import { AppConfig, DetectionEvent } from '../types';
import { WindowsDetector } from '../native/windows-detector';
import { MacOSDetector } from '../native/macos-detector';
import { LinuxDetector } from '../native/linux-detector';
import { RotatingLogger } from '../utils/logger';
import { JsonStorage } from '../storage/json-storage';
import { WebhookNotifier } from '../handlers/webhook-notifier';
import { EmailNotifier } from '../handlers/email-notifier';
import { ActionHandler } from '../handlers/action-handler';

type PlatformDetector = {
  poll: () => Promise<DetectionEvent[]>;
};

export class ScreenDetector extends EventEmitter {
  private interval?: NodeJS.Timeout;
  private readonly logger: RotatingLogger;
  private readonly storage: JsonStorage;
  private readonly detector: PlatformDetector;
  private readonly webhookNotifier?: WebhookNotifier;
  private readonly emailNotifier?: EmailNotifier;
  private readonly actionHandler: ActionHandler;

  constructor(private readonly config: AppConfig) {
    super();
    this.logger = new RotatingLogger(config.logFile, config.logMaxSizeBytes, config.logMaxFiles);
    this.storage = new JsonStorage(config.eventStorageFile);
    this.detector = this.createDetector();
    this.actionHandler = new ActionHandler(config.actions);

    if (config.webhook.enabled && config.webhook.url) {
      this.webhookNotifier = new WebhookNotifier(
        config.webhook.url,
        config.webhook.retryCount,
        config.webhook.retryDelayMs,
        config.webhook.timeoutMs,
      );
    }

    if (config.email.enabled) {
      this.emailNotifier = new EmailNotifier(config.email);
    }
  }

  start(): void {
    if (this.interval) return;

    this.logger.log('info', `Starting detector on platform ${process.platform}`);
    this.interval = setInterval(() => {
      this.poll().catch((error) => {
        this.logger.log('error', `Polling failed: ${(error as Error).message}`);
      });
    }, this.config.detectionIntervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
      this.logger.log('info', 'Detector stopped');
    }
  }

  private async poll(): Promise<void> {
    const events = await this.detector.poll();
    for (const event of events) {
      await this.handleDetection(event);
    }
  }

  private async handleDetection(event: DetectionEvent): Promise<void> {
    this.storage.append(event);
    this.logger.log('warn', `${event.kind} via ${event.source}: ${event.detail}`);
    this.emit('detection', event);

    if (this.webhookNotifier) {
      const sent = await this.webhookNotifier.notify(event);
      if (!sent) this.logger.log('error', 'Webhook notification failed after retries');
    }

    if (this.emailNotifier) {
      try {
        await this.emailNotifier.notify(event);
      } catch (error) {
        this.logger.log('error', `Email notification failed: ${(error as Error).message}`);
      }
    }

    await this.actionHandler.run();
  }

  private createDetector(): PlatformDetector {
    if (process.platform === 'win32') return new WindowsDetector();
    if (process.platform === 'darwin') return new MacOSDetector();
    return new LinuxDetector();
  }
}
