# Workbench Core Infrastructure

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |

## Description
Workbench core components are designed to work with existing infrastructure when available. When infrastructure is not available this package is here to help. This package serves two purposes. First, to help fill in the gaps where organizations are diverging from reference infrastructure, but still need to deploy a few elements. Second, to assist solution developers by providing easy to configure CDK style constructs which can be used as infrastructure building blocks in their solutions.

## Components
- [WorkbenchCognito](./docs/workbenchCognito.md)
