# `repo-toolbox`

## Description
Most mono-repositories contain a top-level `README.md` file which outlines the contents and goals of the repository. Individual packages within the larger repository also have `README.md` files which describe the contents and usage of that package. The `repo-toolbox` provides a command-line driven tool for adding a convenient lookup table to the repository's top-level `README.md` which lists
- Folder: the path to each package in the solution
- Package: the `package.json` defined `name` for each package.
- README: a link to the `README.md` file for that package.

The following example is a snapshot from the [monorepo-for-service-workbench README.md](https://github.com/awslabs/monorepo-for-service-workbench/blob/main/README.md).

### --- Begin Example ---
<!-- GENERATED PROJECT SUMMARY START -->

## Packages

<!-- the table below was generated using the ./repo-scripts/repo-toolbox script -->

| Folder | Package | README |
| ------ | ------- | ------ |
| [solutions/swb-app](./solutions/swb-app/) | [@amzn/swb-app] | [README](./solutions/swb-app/README.md)
| [solutions/swb-reference](./solutions/swb-reference/) | [@amzn/swb-reference] | [README](./solutions/swb-reference/README.md)
| [solutions/swb-ui](./solutions/swb-ui/) | [@amzn/swb-ui] | [README](./solutions/swb-ui/README.md)
| [solutions/swb-ui/infrastructure](./solutions/swb-ui/infrastructure/) | [@amzn/swb-ui-infrastructure] | [README](./solutions/swb-ui/infrastructure/README.md)
| [workbench-core/audit](./workbench-core/audit/) | [@amzn/workbench-core-audit] | [README](./workbench-core/audit/README.md)
| [workbench-core/authentication](./workbench-core/authentication/) | [@amzn/workbench-core-authentication] | [README](./workbench-core/authentication/README.md)
| [workbench-core/authorization](./workbench-core/authorization/) | [@amzn/workbench-core-authorization] | [README](./workbench-core/authorization/README.md)
| [workbench-core/base](./workbench-core/base/) | [@amzn/workbench-core-base] | [README](./workbench-core/base/README.md)
| [workbench-core/datasets](./workbench-core/datasets/) | [@amzn/workbench-core-datasets] | [README](./workbench-core/datasets/README.md)
| [workbench-core/environments](./workbench-core/environments/) | [@amzn/workbench-core-environments] | [README](./workbench-core/environments/README.md)
| [workbench-core/eslint-custom](./workbench-core/eslint-custom/) | [@amzn/eslint-config-workbench-core-eslint-custom] | [README](./workbench-core/eslint-custom/README.md)
| [workbench-core/infrastructure](./workbench-core/infrastructure/) | [@amzn/workbench-core-infrastructure] | [README](./workbench-core/infrastructure/README.md)
| [workbench-core/logging](./workbench-core/logging/) | [@amzn/workbench-core-logging] | [README](./workbench-core/logging/README.md)
| [workbench-core/repo-scripts/repo-toolbox](./workbench-core/repo-scripts/repo-toolbox/) | [@amzn/workbench-core-repo-toolbox] | [README](./workbench-core/repo-scripts/repo-toolbox/README.md)
<!-- GENERATED PROJECT SUMMARY END -->

### --- End of Example ---

## Usage
This package was built for use with a 'Rush' monorepo and this usage documentation will assume you are using rush.

Edit the top-level `README.md` file and add necessary tags for the `repo-toolbox` `readme` tool to locate the area where the table should be placed.

```md
<!-- GENERATED PROJECT SUMMARY START -->

<!-- GENERATED PROJECT SUMMARY END -->
```

Use the `install-run-rushx.js` script from the `Rush` repository `common` folder to execute the `readme` action from within the project folder. The following script can be used within a CICD mechanism to keep the README up to date. Paths are relative to the root of the `monorepo-for-service-workbench` repository.

```bash
cd workbench-core/repo-scripts/repo-toolbox
node ../../../common/scripts/install-run-rushx.js readme -v || exit_status=$?
if [[ $exit_status != 0 ]]; then
  node ../../../common/scripts/install-run-rushx.js readme
fi
```