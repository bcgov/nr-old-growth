<!-- PROJECT SHIELDS -->

[![Contributors](https://img.shields.io/github/contributors/bcgov/nr-old-growth-integration)](/../../graphs/contributors)
[![Forks](https://img.shields.io/github/forks/bcgov/nr-old-growth-integration)](/../../network/members)
[![Stargazers](https://img.shields.io/github/stars/bcgov/nr-old-growth-integration)](/../../stargazers)
[![Issues](https://img.shields.io/github/issues/bcgov/nr-old-growth-integration)](/../../issues)
[![MIT License](https://img.shields.io/github/license/bcgov/nr-old-growth-integration.svg)](/LICENSE.md)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

The Old Growth Technical Advisory Panel identified old growth areas that are at imminent risk of harvest. The current deferral process could require that licensees do a field verification to confirm, add or delete areas meeting the definition of old growth trees. The Old Growth project amis to help automate that process and enable the tracking and managing of the potential deferral areas and any decisions that come out of that process that may impact licensees.

# Overview

The nr-old-growth is a node.js application built with [Vue.js](https://vuejs.org) in typescript as frontend, [nestJS](https://docs.nestjs.com) as backend, integrated with the [greenfield-template](https://github.com/bcgov/greenfield-template) to automate the process for testing, security scanning, code quality checking, image building and deploying.

This project is in active development. Please visit our [issues](https://github.com/bcgov/nr-old-growth-integration/issues) page to view or request features.

Currently, we uses the [GitHub Actions](https://github.com/bcgov/greenfield-template/actions) [pipeline](https://github.com/bcgov/greenfield-template/blob/main/.github/workflows/pr-open.yml), which includes:

- [Pull Request](https://github.com/bcgov/greenfield-template/pulls)-based ephemeral, sandboxed environments.
- [Docker](https://github.com/marketplace/actions/build-and-push-docker-images)(/Podman) container building.
- [Build caching](https://github.com/marketplace/actions/cache) to save time and bandwidth.
- [GitHub Container Registry](https://github.com/bcgov/greenfield-template/pkgs/container/greenfield-template) image publishing.
- [RedHat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift) deployment, with other options under consideration.
- [OpenShift artifact](https://github.com/bcgov/greenfield-template/blob/main/.github/workflows/pr-close.yml) pruning on PR completion.
- [SonarCloud](https://sonarcloud.io/) continuous code quality and security scanning.
- [GitHub CodeQL](https://codeql.github.com/) semantic code analysis and vulerability scanning.
- [Snyk](https://snyk.io/) development, vulnerability and security scanning.
- [OWASP ZAP](https://owasp.org/www-project-zap/) Zed Attack Proxy security scanning.
- [Jest](https://jestjs.io/) JavaScript testing enforced in-pipeline.
- [ESLint](https://eslint.org/) linting enforced in-pipeline and on code staging.
- [TypeScript](https://www.typescriptlang.org/) strong-typing for JavaScript.

# Get start

We manage the frontend and backend in the same repository but in different folders. To start the frontend/backend project locally, check the Readme inside each frontend/backend folder.

## Set up visual studio code

**Install extensions**:  
ESlint  
Prettier  
Vetur

**Set indent and save on file**:

- Press "cmd+shift+p" and type "Preferences: Open Settings (UI)", select it
- In the open window, update the "Editor: Tab Size" to 2; search "format on save" and check the checkbox

**Enable prettier format**:  
Press "option+shift+f" and select prettier as the formatter
