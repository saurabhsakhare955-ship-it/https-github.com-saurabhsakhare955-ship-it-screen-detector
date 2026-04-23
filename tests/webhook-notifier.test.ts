import { WebhookNotifier } from '../src/handlers/webhook-notifier';
import { DetectionEvent } from '../src/types';

describe('WebhookNotifier', () => {
  const event: DetectionEvent = {
    id: 'evt',
    kind: 'screenshot',
    platform: 'linux',
    source: 'test',
    detail: 'detail',
    timestamp: new Date().toISOString(),
  };

  it('retries and succeeds', async () => {
    let calls = 0;
    const fetchMock = jest.fn(async () => {
      calls += 1;
      if (calls < 2) {
        throw new Error('network');
      }
      return { ok: true } as Response;
    });

    global.fetch = fetchMock;

    const notifier = new WebhookNotifier('https://example.com', 3, 1, 1000);
    const result = await notifier.notify(event);

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('fails after retries', async () => {
    const fetchMock = jest.fn(async () => {
      throw new Error('down');
    });

    global.fetch = fetchMock;

    const notifier = new WebhookNotifier('https://example.com', 2, 1, 1000);
    const result = await notifier.notify(event);

    expect(result).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
