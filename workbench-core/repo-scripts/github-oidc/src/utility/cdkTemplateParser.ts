import * as fs from 'fs';
// import path from 'path';
import { RushConfiguration } from '@microsoft/rush-lib';
import { PolicyStatementProps } from 'aws-cdk-lib/aws-iam';
import * as glob from 'glob';

interface Resource {
  Type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Properties: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Metadata: any;
  UpdateReplacePolicy?: string;
  DeletionPolicy?: string;
}

// interface Statement {
//     Action: string[];
//     Effect: 'Allow' | 'Deny';
//     Resource: object[],
//     Sid?: string
// }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statements: any[] = [];

const rootDir: string = RushConfiguration.loadFromDefaultLocation().rushJsonFolder;

// const stack: string = process.env.STACK!;

const cdkTempateFiles: string[] = glob.sync(`${rootDir}/**/cdk.out/*.template.json`, { nodir: true });

cdkTempateFiles.forEach((cdkTempateFile) => {
  console.log(`Getting permission from the ${cdkTempateFile} file`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const data: string = fs.readFileSync(`${cdkTempateFile}`, 'utf8');
  const jsonData = JSON.parse(data);
  Object.values(jsonData.Resources).forEach((resource) => {
    const resourceType: Resource = resource as unknown as Resource;
    // console.log(Object.keys(resourceType.Properties))
    if (Object.keys(resourceType.Properties).includes('PolicyDocument')) {
      // console.log(resourceType.Properties.PolicyDocument.Statement)
      statements.push(...resourceType.Properties.PolicyDocument.Statement);
    } else if (Object.keys(resourceType.Properties).includes('KeyPolicy')) {
      statements.push(...resourceType.Properties.KeyPolicy.Statement);
    } else if (Object.keys(resourceType.Properties).includes('AssumeRolePolicyDocument')) {
      statements.push(...resourceType.Properties.AssumeRolePolicyDocument.Statement);
    }
  });
});

console.log(JSON.stringify(statements, null, 2));

export { statements };
