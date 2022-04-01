# Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-82.72%25-yellow.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-95.24%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-82.61%25-yellow.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-84%25-yellow.svg?style=flat) |
# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary information to effectively respond to your bug report or contribution.

## Code development and testing

### Prerequisites for development

Code for Ma-Mono is written in TypeScript. This requires your IDE to be able to handle and work with TypeScript. Make sure your IDE displays TS properly, [guide to help](https://medium.com/@netczuk/even-faster-code-formatting-using-eslint-22b80d061461)

This repository uses [Rush](https://rushjs.io/pages/intro/welcome/) as the monorepo manager and [pnpm](https://rushjs.io/pages/maintainer/package_managers/) as it's package manager. Please go through the [Developer tutorial](https://rushjs.io/pages/developer/new_developer/) for Rush usage details

[Ma-mono](https://gitlab.aws.dev/ma-foundation/ma-mono) is hosted on Gitlab ([Decision: Repository for Monorepo](https://quip-amazon.com/jBvNAvWbpq6V/Decision-Repository-for-Monorepo)). In order to start developement please follow the below steps:

1. Follow the instructions [here](https://w.amazon.com/bin/view/AWS/Teams/WWPS/TSD/GitLab/#HJoiningaTeamGroup) to join [MA-Foundation Group](https://gitlab.aws.dev/ma-foundation) in GitLab
2. [Setup git access](https://w.amazon.com/bin/view/AWS/Teams/WWPS/TSD/GitLab/#HSettingupgitAccess)
3. Clone the repo: `git clone git@ssh.gitlab.aws.dev:ma-foundation/ma-mono.git`
4. Move to the correct directory: `cd ma-mono`
5. Install rush: `npm install -g @microsoft/rush`
6. Run [`rush update`](https://rushjs.io/pages/commands/rush_update/) - This ensures rush is set-up and ready to go, which includes installing NPM packages as defined in package.json files
7. NOTE: to install new packages or dependencies: **DO NOT USE** `npm install`. Refer the [documentation](https://rushjs.io/pages/developer/modifying_package_json/) for more details. Packages can be updated in 2 ways:
   - `rush add -p <PACKAGE_NAME>`. See `rush add -h` for more options.
   - Update the package.json in your package and run `rush update`.

### Local Development Flow

1. Set up your repo ([Follow Prerequisites for development](#prerequisites-for-development)) on your local machine
2. Create a feature branch from main: `git pull; git checkout -b feature/<feature>`
3. Run: [`rush check`](https://rushjs.io/pages/commands/rush_check/) - Checks each project's package.json files and ensures that all dependenciesare of the same version throughout the repository.
4. Run either of the two:
   - [`rush build`](https://rushjs.io/pages/commands/rush_build/) - performs incremental build. See `rush build -h` for more options
   - [`rush rebuild`](https://rushjs.io/pages/commands/rush_rebuild/) - performs a full clean build. See `rush rebuild -h` for more options
5. `rush test` - runs test and updates code coverage summary in README file for each package. See `rush test -h` for more options
6. Alternatively you can use:
   - `rush build:test` - single command to perform `rush build && rush test` for each package. See `rush build:test -h` for more options
7. `rush common-coverage-report` - updates root README file with code coverage summary

### Staging a Merge Request

1. Make changes locally ([Follow Local Development Flow](#Local-Development-Flow))
2. Ensure you are on a feature branch; from `main` branch: `git pull; git checkout -b feature/<feature>`
3. If you are happy with your code and they are passing tests, you can push your changes to your feature branch: `git add -A; git commit -m "<Your commit message>"; git push`
    - Note: the commit must be in [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format
4. We have pre-commit git-hooks. These are used to inspect the snapshot that's about to be committed, to see if you've forgotten something, to make sure tests run, or to examine whatever you need to inspect in the code. We currently support:
    - prettier is configured to automatically format your code on commit. If you want to format your code manually you can just do: `git add -A; rush prettier`
    - generate code coverage summary in the root README file
    - A check has been added for commit messages to ensure they are in [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format.
5. Further checks are triggered on a Merge Request. Please refer the [Merge Requests Process](#merge-requests-process) section for how to manage the MR on GitLab

## Merge Requests Process

1. Open a Merge Request in GitLab:
    - Go to [create new MR](https://gitlab.aws.dev/ma-foundation/ma-mono/-/merge_requests/new)
    - For the source branch select your recently pushed feature branch
    - As your target branch choose `main`
    - Choose a proper title
        - Note: the title will appear as the commit message when the MR is merged, please make sure the title adheres to the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) format, 
    - Choose a proper description
    - Assign yourself as the assignee
    - Add reviewers ([See limitations](https://quip-amazon.com/jBvNAvWbpq6V/Decision-Repository-for-Monorepo#temp:C:XHKd59c38e62a0c4e2c94800bcf7)).
    - Click `Create merge request`
2. Opening a Merge Request triggers build with 3 stages:
    - **build-and-test** ([Reference](https://rushjs.io/pages/maintainer/enabling_ci_builds/))
        - `Performs AWS CodeArtifact Login` we are using codeArtifact to download NPM packages
        - `rush install` (you will notice that we are using `rush install` instead of `rush update` here. The difference is that `rush install` won't update any files. Instead, it will fail your MR build if something is out of date, to let you know that you forgot to run `rush update` or forgot to commit the result)
        - `rush check`
        - `rush rebuild`
        - `rush test`
        - `rush make-badges --ci` (throws an error if the generated code coverage badges do not match what is already in each package README file)
        - `rush common-coverage-ci` (throws an error if the generated code coverage badges do not match what is already in the root README file)
    - **security-scan** - Performs security scanning:
        - [Container-Scanning](https://docs.gitlab.com/ee/user/application_security/container_scanning/)
        - [SAST](https://docs.gitlab.com/ee/user/application_security/sast/)
        - [Secret-Detection](https://docs.gitlab.com/ee/user/application_security/secret_detection/)
        - [SAST-IaC](https://docs.gitlab.com/ee/user/application_security/iac_scanning/)
        - [License-Scanning](https://docs.gitlab.com/ee/user/compliance/license_compliance/#include-the-license-scanning-template)
    - **security-scan-eval** - Evaluates report generated by: 
        - [Secret-Detection](https://docs.gitlab.com/ee/user/application_security/secret_detection/) template in the **security-scan** stage and fails the build when secrets are detected.
        - [Container-Scanning](https://docs.gitlab.com/ee/user/application_security/container_scanning/) template in the **security-scan** stage and fails the build when vulnerabilities are detected.
3. Once the build is successful and reviewers have approved your changes. Please contact a [Maintainer](https://quip-amazon.com/jBvNAvWbpq6V/Decision-Repository-for-Monorepo#temp:C:XHK259edb7d77b44c3a85de0c1a4) to Merge your code to the main branch (Apologies for the inconvenience but this is the process we are going to follow due to the [limitations](https://quip-amazon.com/jBvNAvWbpq6V/Decision-Repository-for-Monorepo#temp:C:XHKd59c38e62a0c4e2c94800bcf7))

## Finding contributions to work on

Looking at the existing issues is a great way to find something to contribute on. As our projects, by default, use the default GitHub issue labels (enhancement/bug/duplicate/help wanted/invalid/question/wontfix), looking at any 'help wanted' issues is a great place to start.

## Code of Conduct

This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct).
For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact
opensource-codeofconduct@amazon.com with any additional questions or comments.

## Security issue notifications

If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public github issue.

## Licensing

See the [LICENSE](LICENSE) file for our project's licensing. We will ask you to confirm the licensing of your contribution.