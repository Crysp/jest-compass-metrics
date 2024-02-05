import { getInput, setOutput, error, info, debug } from '@actions/core';
import { exec } from '@actions/exec';
import * as fs from 'fs';

const execCommand = async (command: string): Promise<string> => {
  const output: string[] = [];
  const options = {
    silent: true,
    listeners: {
      stdline: (data: string) => {
        output.push(data);
      },
    },
    cwd: './',
  };
  try {
    await exec(command, [], options);
    return Promise.resolve(output.join('\n'));
  } catch (e) {
    error(`ExecCommand error: ${e}`);
    return Promise.reject(e);
  }
};

const existsCoverageReport = () => {
  return fs.existsSync('./coverage/lcov.info');
};

const getCoveragePercent = async (): Promise<number> => {
  if (!existsCoverageReport()) {
    return 0;
  }

  const percent = await execCommand(
    'npx coverage-percentage ./coverage/lcov.info --lcov',
  );
  return Number(parseFloat(percent).toFixed(2));
};

async function run() {
  const testScript = getInput('test-script');

  const npm = await execCommand('npm --version');

  debug(npm);

  const yarn = await execCommand('yarn --version');

  debug(yarn);

  await execCommand(testScript);

  const percent = await getCoveragePercent();

  info(`Percent: ${percent}%`);

  setOutput('percent', percent);
}

run();
