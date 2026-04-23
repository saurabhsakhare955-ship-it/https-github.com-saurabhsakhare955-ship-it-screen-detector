import fs from 'node:fs';
import path from 'node:path';
import { DetectionEvent, DetectionKind } from '../types';
import { execCommand } from '../utils/exec';

export abstract class BaseDetector {
  protected readonly knownTools = ['sharex', 'snagit', 'obs', 'screenflow', 'camtasia'];
  private readonly seenFiles = new Set<string>();

  constructor(protected readonly platform: NodeJS.Platform) {}

  protected buildEvent(kind: DetectionKind, source: string, detail: string, tool?: string): DetectionEvent {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      kind,
      platform: this.platform,
      source,
      detail,
      tool,
      timestamp: new Date().toISOString(),
    };
  }

  protected scanRecentFiles(dirs: string[], patterns: RegExp[]): DetectionEvent[] {
    const found: DetectionEvent[] = [];

    for (const dir of dirs) {
      if (!dir || !fs.existsSync(dir)) continue;
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (!patterns.some((pattern) => pattern.test(entry))) continue;
        const full = path.join(dir, entry);
        if (this.seenFiles.has(full)) continue;

        const stats = fs.statSync(full);
        if (Date.now() - stats.mtimeMs > 60_000) continue;

        this.seenFiles.add(full);
        found.push(this.buildEvent('screenshot', 'filesystem', `New screenshot file: ${entry}`));
      }
    }

    return found;
  }

  protected async detectRunningTools(command: string): Promise<DetectionEvent[]> {
    const output = (await execCommand(command)).toLowerCase();
    return this.knownTools
      .filter((tool) => output.includes(tool))
      .map((tool) =>
        this.buildEvent('screen_recording', 'process_monitor', `Detected running tool: ${tool}`, tool),
      );
  }

  abstract poll(): Promise<DetectionEvent[]>;
}
