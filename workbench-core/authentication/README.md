# Workbench Core Authentication

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-99.2%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-97.95%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-99.19%25-brightgreen.svg?style=flat) |

## Description

This package contains services for authentication and user management.

NOTICE: The user management service does not include authorization in any form. If a user management service function is called, it assumes that the caller has permission to perform the given action.

## Usage
[Authentication Service](./docs/authenticationService.md)

[User Management Service](./docs/userManagementService.md)
