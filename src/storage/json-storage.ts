import fs from 'node:fs';
import path from 'node:path';
import { DetectionEvent } from '../types';

export class JsonStorage {
  constructor(private readonly filePath: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf-8');
    }
  }

  append(event: DetectionEvent): void {
    const current = this.readAll();
    current.push(event);
    fs.writeFileSync(this.filePath, JSON.stringify(current, null, 2), 'utf-8');
  }

  readAll(): DetectionEvent[] {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(content) as DetectionEvent[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
