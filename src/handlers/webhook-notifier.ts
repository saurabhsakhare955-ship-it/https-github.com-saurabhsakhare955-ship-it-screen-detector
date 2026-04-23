import { DetectionEvent } from '../types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class WebhookNotifier {
  constructor(
    private readonly url: string,
    private readonly retryCount: number,
    private readonly retryDelayMs: number,
    private readonly timeoutMs: number,
  ) {}

  async notify(event: DetectionEvent): Promise<boolean> {
    for (let attempt = 1; attempt <= this.retryCount; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(this.url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(event),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (response.ok) return true;
      } catch {
        clearTimeout(timeout);
      }

      if (attempt < this.retryCount) {
        await wait(this.retryDelayMs * attempt);
      }
    }

    return false;
  }
}
