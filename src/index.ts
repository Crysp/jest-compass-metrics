import { getInput, setOutput, error, info } from '@actions/core';
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

const getCoveragePercent = async (): Promise<number> => {
  const percent = await execCommand(
    'npx coverage-percentage ./coverage/lcov.info --lcov',
  );
  return Number(parseFloat(percent).toFixed(2));
};

async function run() {
  const JIRA_USER = getInput('jira-user');
  const JIRA_API_TOKEN = getInput('jira-token');
  const testScript = getInput('test-script');

  await execCommand(testScript);

  const percent = await getCoveragePercent();

  info(`Percent: ${percent}%`);

  setOutput('percent', percent);

  await execCommand(`curl --request POST \\
--url https://teem-co.atlassian.net/gateway/api/compass/v1/metrics \\
--user "${JIRA_USER}:${JIRA_API_TOKEN}" \\
--header "Accept: application/json" \\
--header "Content-Type: application/json" \\
--data "{
  \\"metricSourceId\\": \\"ari:cloud:compass:ba4bd631-12ed-4459-8a28-ee995fd1ee44:metric-source/68ae38a8-55f1-43d6-9a0c-7393f5dbd9d3/d34a60d1-a59a-45b3-b16a-172a95f19c07\\",
  \\"value\\": ${percent},
  \\"timestamp\\": \\"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\\"
}"`);
}

run();
