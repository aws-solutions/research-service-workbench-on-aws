# Monorepo for Service Workbench Development Instructions

## Prerequisites for development

Code for [monorepo-for-service-workbench](https://github.com/awslabs/monorepo-for-service-workbench) is written in TypeScript. It is highly recommended you configure your IDE to render TypeScript errors and warnings. To make sure your IDE displays TS properly, see this [guide to help](https://medium.com/@netczuk/even-faster-code-formatting-using-eslint-22b80d061461)

This repository uses [Rush](https://rushjs.io/pages/intro/welcome/) as the monorepo manager and [pnpm](https://rushjs.io/pages/maintainer/package_managers/) as it's package manager. Please go through the [Developer tutorial](https://rushjs.io/pages/developer/new_developer/) for Rush usage details

1. Clone the repo: `git clone https://github.com/awslabs/monorepo-for-service-workbench.git`
2. Move to the correct directory: `cd monorepo-for-service-workbench`
3. Install rush: `npm install -g @microsoft/rush`
4. Run [`rush update`](https://rushjs.io/pages/commands/rush_update/) - This ensures rush is set-up and ready to go, which includes installing NPM packages as defined in package.json files
5. NOTE: to install new packages or dependencies: **DO NOT USE** `npm install`. Refer the [documentation](https://rushjs.io/pages/developer/modifying_package_json/) for more details. Packages can be updated in 2 ways:
   - `rush add -p <PACKAGE_NAME>`. See `rush add -h` for more options.
   - Update the package.json in your package and run `rush update`.

## Local development flow

1. Set up your repo ([Follow Prerequisites for development](#prerequisites-for-development)) on your local machine
2. Create a feature branch from `develop`: `git pull; git checkout -b feature/<feature>`
3. Run: [`rush check`](https://rushjs.io/pages/commands/rush_check/) - Checks each project's package.json files and ensures that all dependencies are of the same version throughout the repository.
4. Run either of the two:
   - [`rush build`](https://rushjs.io/pages/commands/rush_build/) - performs incremental build. See `rush build -h` for more options
   - [`rush rebuild`](https://rushjs.io/pages/commands/rush_rebuild/) - performs a full clean build. See `rush rebuild -h` for more options
5. `rush test` - runs test and updates code coverage summary in README file for each package. See `rush test -h` for more options
6. Alternatively you can use:
   - `rush build:test` - single command to perform `rush build && rush test` for each package. See `rush build:test -h` for more options
7. `rush common-coverage-report` - updates root README file with code coverage summary

## Staging a Pull Request

1. Make changes locally ([Follow Local Development Flow](#Local-Development-Flow))
2. Ensure you are on a feature branch; from `develop` branch: `git pull; git checkout develop; git checkout -b feature/<feature>`
3. If you are happy with your code and they are passing tests, you can push your changes to your feature branch: `git add -A; git commit`
    - Note: the commit must be in [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format
4. `git commit` will trigger [commitizen](https://github.com/commitizen/cz-cli) and you'll be prompted to fill out any required commit fields at commit time.
5. We have pre-commit git-hooks. These are used to inspect the snapshot that's about to be committed, to see if you've forgotten something, to make sure tests run, or to examine whatever you need to inspect in the code. We currently support:
    - [git-secrets](https://github.com/awslabs/git-secrets) prevents you from committing passwords and other sensitive information to a git repository
    - prettier is configured to automatically format your code on commit. If you want to format your code manually you can just do: `git add -A; rush prettier`
    - generate code coverage summary in the root README file
6. We have commit-msg git-hook configured:
    - A check has been added for commit messages to ensure they are in [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format.
7. `git push`
8. Further checks are triggered on a Pull Request. Please refer the [Pull Requests Process](#pull-requests-process) section

## Pull Requests Process

Please refer to [Contributing via Pull Requests](./CONTRIBUTING.md#contributing-via-pull-requests)