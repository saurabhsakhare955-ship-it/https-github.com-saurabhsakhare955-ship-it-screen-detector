import fs from 'node:fs';
import path from 'node:path';

export class RotatingLogger {
  constructor(
    private readonly filePath: string,
    private readonly maxSizeBytes: number,
    private readonly maxFiles: number,
  ) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  log(level: string, message: string): void {
    this.rotateIfNeeded();
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(this.filePath, line, 'utf-8');
  }

  private rotateIfNeeded(): void {
    if (!fs.existsSync(this.filePath)) return;
    const { size } = fs.statSync(this.filePath);
    if (size < this.maxSizeBytes) return;

    const rotated = `${this.filePath}.${Date.now()}`;
    fs.renameSync(this.filePath, rotated);
    this.pruneOldLogs();
  }

  private pruneOldLogs(): void {
    const dir = path.dirname(this.filePath);
    const base = path.basename(this.filePath);
    const logs = fs
      .readdirSync(dir)
      .filter((name) => name.startsWith(`${base}.`))
      .map((name) => ({
        name,
        time: fs.statSync(path.join(dir, name)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time);

    logs.slice(this.maxFiles).forEach((log) => {
      fs.rmSync(path.join(dir, log.name), { force: true });
    });
  }
}
