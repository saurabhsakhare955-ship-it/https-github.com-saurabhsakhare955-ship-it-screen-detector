export type DetectionKind = 'screenshot' | 'screen_recording';

export interface DetectionEvent {
  id: string;
  kind: DetectionKind;
  platform: NodeJS.Platform;
  source: string;
  detail: string;
  tool?: string;
  timestamp: string;
}

export interface AppConfig {
  detectionIntervalMs: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFile: string;
  logMaxSizeBytes: number;
  logMaxFiles: number;
  eventStorageFile: string;
  webhook: {
    enabled: boolean;
    url: string;
    retryCount: number;
    retryDelayMs: number;
    timeoutMs: number;
  };
  email: {
    enabled: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    to: string;
  };
  actions: {
    blur: boolean;
    lock: boolean;
    terminate: boolean;
    terminateTargets: string[];
  };
}
