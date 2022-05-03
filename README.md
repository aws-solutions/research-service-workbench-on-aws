# Worflow Status
[![Build-and-test](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Build-and-test/badge.svg)](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Build-and-test/badge.svg)
[![Dev-deploy-and-integration-test](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Dev-deploy-and-integration-test/badge.svg?)](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Dev-deploy-and-integration-test/badge.svg)
[![Cfn-nag-scan](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Cfn-nag-scan/badge.svg)](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Cfn-nag-scan/badge.svg)
[![Secret-scan](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Secret-scan/badge.svg)](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Secret-scan/badge.svg)
[![Viperlight-scan](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Viperlight-scan/badge.svg)](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Viperlight-scan/badge.svg)
[![GitHub-release](https://github.com/awslabs/monorepo-for-service-workbench/workflows/GitHub-release/badge.svg)](https://github.com/awslabs/monorepo-for-service-workbench/workflows/GitHub-release/badge.svg)
[![Lint-PR](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Lint-pr/badge.svg)](https://github.com/awslabs/monorepo-for-service-workbench/workflows/Lint-pr/badge.svg)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-88.58%25-yellow.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-80.18%25-yellow.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-91.34%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-89.41%25-yellow.svg?style=flat) |
# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary information to effectively respond to your bug report or contribution.

## Code development and testing

### Prerequisites for development

Code for [monorepo-for-service-workbench](https://github.com/awslabs/monorepo-for-service-workbench) is written in TypeScript. This requires your IDE to be able to handle and work with TypeScript. Make sure your IDE displays TS properly, [guide to help](https://medium.com/@netczuk/even-faster-code-formatting-using-eslint-22b80d061461)

This repository uses [Rush](https://rushjs.io/pages/intro/welcome/) as the monorepo manager and [pnpm](https://rushjs.io/pages/maintainer/package_managers/) as it's package manager. Please go through the [Developer tutorial](https://rushjs.io/pages/developer/new_developer/) for Rush usage details

[monorepo-for-service-workbench](https://github.com/awslabs/monorepo-for-service-workbench) is hosted on GitHub. In order to start developement please follow the steps below:

1. Clone the repo: `https://github.com/awslabs/monorepo-for-service-workbench.git`
2. Move to the correct directory: `cd monorepo-for-service-workbench`
3. Install rush: `npm install -g @microsoft/rush`
4. Run [`rush update`](https://rushjs.io/pages/commands/rush_update/) - This ensures rush is set-up and ready to go, which includes installing NPM packages as defined in package.json files
5. NOTE: to install new packages or dependencies: **DO NOT USE** `npm install`. Refer the [documentation](https://rushjs.io/pages/developer/modifying_package_json/) for more details. Packages can be updated in 2 ways:
   - `rush add -p <PACKAGE_NAME>`. See `rush add -h` for more options.
   - Update the package.json in your package and run `rush update`.

### Local Development Flow

1. Set up your repo ([Follow Prerequisites for development](#prerequisites-for-development)) on your local machine
2. Create a feature branch from main: `git pull; git checkout -b feature/<feature>`
3. Run: [`rush check`](https://rushjs.io/pages/commands/rush_check/) - Checks each project's package.json files and ensures that all dependencies are of the same version throughout the repository.
4. Run either of the two:
   - [`rush build`](https://rushjs.io/pages/commands/rush_build/) - performs incremental build. See `rush build -h` for more options
   - [`rush rebuild`](https://rushjs.io/pages/commands/rush_rebuild/) - performs a full clean build. See `rush rebuild -h` for more options
5. `rush test` - runs test and updates code coverage summary in README file for each package. See `rush test -h` for more options
6. Alternatively you can use:
   - `rush build:test` - single command to perform `rush build && rush test` for each package. See `rush build:test -h` for more options
7. `rush common-coverage-report` - updates root README file with code coverage summary

### Staging a Pull Request

1. Make changes locally ([Follow Local Development Flow](#Local-Development-Flow))
2. Ensure you are on a feature branch; from `develop` branch: `git pull; git checkout -b feature/<feature>`
3. If you are happy with your code and they are passing tests, you can push your changes to your feature branch: `git add -A; git commit`
    - Note: the commit must be in [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format
4. `git commit` will trigger [commitizen](https://github.com/commitizen/cz-cli) and you'll be prompted to fill out any required commit fields at commit time.
5. We have pre-commit git-hooks. These are used to inspect the snapshot that's about to be committed, to see if you've forgotten something, to make sure tests run, or to examine whatever you need to inspect in the code. We currently support:
    - [git-secrets](https://github.com/awslabs/git-secrets) prevents you from committing passwords and other sensitive information to a git repository
    - prettier is configured to automatically format your code on commit. If you want to format your code manually you can just do: `git add -A; rush prettier`
    - generate code coverage summary in the root README file
6. We have commit-msg git-hook:
    - A check has been added for commit messages to ensure they are in [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format.
7. `git push`
8. Further checks are triggered on a Pull Request. Please refer the [Pull Requests Process](#pull-requests-process) section for how to manage the MR on GitLab

## Pull Requests Process

Please refer to [Contributing via Pull Requests](./CONTRIBUTING.md#contributing-via-pull-requests)

## Finding contributions to work on

Looking at the existing issues is a great way to find something to contribute on. As our projects, by default, use the default GitHub issue labels (enhancement/bug/duplicate/help wanted/invalid/question/wontfix), looking at any 'help wanted' issues is a great place to start.

## Packages

| Folder | Package |
| ------ | ------- |
| [solutions/swb-app](./solutions/swb-app/) | [@amzn/swb-app] |
| [solutions/swb-reference/](./solutions/swb-reference/) | [@amzn/swb-reference] |
| [solutions/example-ui-app](./solutions/example-ui-app/) | [@amzn/example-ui-app] |
| [workbench-core/environments](./workbench-core/environments/) | [@amzn/environments] |
| [workbench-core/logging](./workbench-core/logging/) | [@amzn/workbench-core-logging] |
| [workbench-core/base](./workbench-core/base/) | [@amzn/workbench-core-base] |
| [workbench-core/eslint-custom](./workbench-core/eslint-custom/) | [@amzn/eslint-config-workbench-core-eslint-custom] |
| [workbench-core/authorization](./workbench-core/authorization/) | [@amzn/workbench-core-authorization] |
| [workbench-core/authentication](./workbench-core/authentication/) | [@amzn/workbench-core-authentication] |
| [workbench-core/audit](./workbench-core/audit/) | [@amzn/workbench-core-audit] |

## Code of Conduct

This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct).
For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact
opensource-codeofconduct@amazon.com with any additional questions or comments.

## Security issue notifications

If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public github issue.

## Licensing

See the [LICENSE](LICENSE) file for our project's licensing. We will ask you to confirm the licensing of your contribution.