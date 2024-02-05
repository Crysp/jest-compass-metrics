import { getInput, error, info } from '@actions/core';
import { exec } from '@actions/exec';
import * as fs from 'fs';

async function run() {
  const testScript = getInput('test-script');

  await execCommand(testScript);

  const percent = await getCoveragePercent();

  info(`Percent: ${percent}%`);
}

run();

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
