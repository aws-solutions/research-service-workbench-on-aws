import * as fs from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

function getConstants(): {
  STAGE: string;
  API_BASE_URL: string;
  AWS_REGION: string;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = yaml.load(
    // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
    // correct file
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(join(__dirname, `./config/${process.env.STAGE}.yaml`), 'utf8') // nosemgrep
  );

  const API_BASE_URL = config.apiBaseUrl;
  const AWS_REGION = config.awsRegion;

  return {
    STAGE: config.stage,
    API_BASE_URL,
    AWS_REGION
  };
}

export { getConstants };
