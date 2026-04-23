import { ActionHandler } from '../src/handlers/action-handler';
import { execCommand } from '../src/utils/exec';

jest.mock('../src/utils/exec', () => ({
  execCommand: jest.fn(async () => ''),
}));

const mockedExec = execCommand as jest.MockedFunction<typeof execCommand>;

function setPlatform(platform: NodeJS.Platform): void {
  Object.defineProperty(process, 'platform', { value: platform });
}

describe('ActionHandler', () => {
  beforeEach(() => {
    mockedExec.mockClear();
  });

  it('runs blur/lock/terminate actions on linux', async () => {
    setPlatform('linux');
    const handler = new ActionHandler({
      blur: true,
      lock: true,
      terminate: true,
      terminateTargets: ['obs', 'bad target;rm -rf'],
    });

    await handler.run();

    expect(mockedExec).toHaveBeenCalledWith('xdg-screensaver activate');
    expect(mockedExec).toHaveBeenCalledWith('loginctl lock-session');
    expect(mockedExec).toHaveBeenCalledWith('pkill -f obs');
    expect(mockedExec).toHaveBeenCalledWith('pkill -f badtargetrm-rf');
  });

  it('locks workstation on windows branch', async () => {
    setPlatform('win32');
    const handler = new ActionHandler({
      blur: false,
      lock: true,
      terminate: false,
      terminateTargets: [],
    });

    await handler.run();

    expect(mockedExec).toHaveBeenCalledWith('rundll32.exe user32.dll,LockWorkStation');
  });
});
