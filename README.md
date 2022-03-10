# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary information to effectively respond to your bug report or contribution.

## Code development and testing

### Prerequisites for development
Code for Ma-Mono is written in TypeScript. This requires your IDE to be able to handle and work with TypeScript. Make sure your IDE displays TS properly

> https://medium.com/@netczuk/even-faster-code-formatting-using-eslint-22b80d061461

[Ma-mono](https://gitlab.aws.dev/ma-foundation/ma-mono) is hosted on Gitlab ([Decision: Repository for Monorepo](https://quip-amazon.com/jBvNAvWbpq6V/Decision-Repository-for-Monorepo)). In order to start developement please follow the below steps:
1. [Join MA-Foundation Group](https://w.amazon.com/bin/view/AWS/Teams/WWPS/TSD/GitLab/#HJoiningaTeamGroup) in [GitLab](https://gitlab.aws.dev/ma-foundation)
2. [Setup git access](https://w.amazon.com/bin/view/AWS/Teams/WWPS/TSD/GitLab/#HSettingupgitAccess)
3. Clone the repo: 
    > `git clone git@ssh.gitlab.aws.dev:ma-foundation/ma-mono.git`

This repository uses [Rush](https://rushjs.io/pages/intro/welcome/) as the monorepo manager and [pnpm](https://rushjs.io/pages/maintainer/package_managers/) as it's package manager.

Please go through the [Developer tutorial](https://rushjs.io/pages/developer/new_developer/) for Rush usage details

### Local Developer Usecase
1. Clone the repo ([Follow Prerequisites for development](#prerequisites-for-development)) on your local machine
2. cd ma-mono
3. Create a feature branch from main: 
    > `git pull; git checkout -b feature/xxx`
4. > `npm install -g @microsoft/rush`
5. > [rush update](https://rushjs.io/pages/commands/rush_update/) (Install NPM packages as needed)
6. Make changes to the package you are working on 
7. > [rush check](https://rushjs.io/pages/commands/rush_check/) (Checks each project's package.json files and ensures that all dependencies
are of the same version throughout the repository.)
8. > [rush build](https://rushjs.io/pages/commands/rush_build/) (performs incremental build) See `rush build -h` for more options or [rush rebuild](https://rushjs.io/pages/commands/rush_rebuild/) (performs a full clean build) See `rush rebuild -h` for more options
9. > `rush test` See `rush test -h` for more options
10. If the above commands are successful, you can push your changes: 
    > `git add <updated files>; git commit -m "<Your commit message>"; git push`
11. Git-hooks:
    - Pre-commit git-hook: Prettier is configured to automatically format your code on commit. Additionally, if you want to format your code manually you can just do: 
        > `git add <updated files>; rush prettier`

    - A check has been added for commit messages: `The message must contain at least 3 words`
12. Builds are not triggered on push, instead builds are triggered when you open a Merge Request. Please refer the [Contributing via Merge Requests](#contributing-via-merge-requests) section

## Contributing via Merge Requests

1. Open a Merge Request in GitLab:
    - Add reviewers ([See limitations](https://quip-amazon.com/jBvNAvWbpq6V/Decision-Repository-for-Monorepo#temp:C:XHKd59c38e62a0c4e2c94800bcf7)).
    
2. Opening a Merge Request triggers build with 2 stages:
    - **build-and-test** ([Reference](https://rushjs.io/pages/maintainer/enabling_ci_builds/))
        - `Performs AWS CodeArtifact Login` we are using codeArtifact to download NPM packages
        - > `rush install` (you will notice that we are using `rush install` instead of `rush update` here. The difference is that `rush install` won't update any files. Instead, it will fail your MR build if something is out of date, to let you know that you forgot to run `rush update` or forgot to commit the result)
        - > `rush check`
        - > `rush rebuild`
        - > `rush test`
    - **secret-scan** - Performs security scanning:
        - [Container-Scanning](https://docs.gitlab.com/ee/user/application_security/container_scanning/)
        - [SAST](https://docs.gitlab.com/ee/user/application_security/sast/)
        - [Secret-Detection](https://docs.gitlab.com/ee/user/application_security/secret_detection/)
        - [SAST-IaC](https://docs.gitlab.com/ee/user/application_security/iac_scanning/)
        - [License-Scanning](https://docs.gitlab.com/ee/user/compliance/license_compliance/#include-the-license-scanning-template)
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