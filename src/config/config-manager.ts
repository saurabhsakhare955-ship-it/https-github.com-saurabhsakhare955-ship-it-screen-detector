import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { AppConfig } from '../types';

dotenv.config();

function toBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export class ConfigManager {
  static load(): AppConfig {
    const defaults: AppConfig = {
      detectionIntervalMs: toNumber(process.env.DETECTION_INTERVAL_MS, 2000),
      logLevel: (process.env.LOG_LEVEL as AppConfig['logLevel']) || 'info',
      logFile: process.env.LOG_FILE || './logs/detection.log',
      logMaxSizeBytes: toNumber(process.env.LOG_MAX_SIZE_BYTES, 1024 * 1024),
      logMaxFiles: toNumber(process.env.LOG_MAX_FILES, 5),
      eventStorageFile: process.env.EVENT_STORAGE_FILE || './data/detections.json',
      webhook: {
        enabled: toBoolean(process.env.WEBHOOK_ENABLED),
        url: process.env.WEBHOOK_URL || '',
        retryCount: toNumber(process.env.WEBHOOK_RETRY_COUNT, 3),
        retryDelayMs: toNumber(process.env.WEBHOOK_RETRY_DELAY_MS, 1000),
        timeoutMs: toNumber(process.env.WEBHOOK_TIMEOUT_MS, 5000),
      },
      email: {
        enabled: toBoolean(process.env.EMAIL_ENABLED),
        host: process.env.SMTP_HOST || '',
        port: toNumber(process.env.SMTP_PORT, 587),
        secure: toBoolean(process.env.SMTP_SECURE),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.EMAIL_FROM || 'screen-detector@example.com',
        to: process.env.EMAIL_TO || 'security@example.com',
      },
      actions: {
        blur: toBoolean(process.env.ACTION_BLUR),
        lock: toBoolean(process.env.ACTION_LOCK),
        terminate: toBoolean(process.env.ACTION_TERMINATE),
        terminateTargets: (process.env.TERMINATE_TARGETS || '')
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
      },
    };

    const jsonPath = process.env.CONFIG_JSON_PATH;
    if (!jsonPath) return defaults;

    const absolutePath = path.resolve(jsonPath);
    if (!fs.existsSync(absolutePath)) return defaults;

    try {
      const content = fs.readFileSync(absolutePath, 'utf-8');
      const parsed = JSON.parse(content) as Partial<AppConfig>;
      return {
        ...defaults,
        ...parsed,
        webhook: { ...defaults.webhook, ...(parsed.webhook || {}) },
        email: { ...defaults.email, ...(parsed.email || {}) },
        actions: { ...defaults.actions, ...(parsed.actions || {}) },
      };
    } catch {
      return defaults;
    }
  }
}
