import { ConfigManager } from './config/config-manager';
import { ScreenDetector } from './core/detector';

const config = ConfigManager.load();
const detector = new ScreenDetector(config);

detector.on('detection', (event) => {
  console.log(`[DETECTED] ${event.kind} ${event.platform} ${event.source} ${event.detail}`);
});

detector.start();

process.on('SIGINT', () => {
  detector.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  detector.stop();
  process.exit(0);
});
