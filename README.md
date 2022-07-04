<!-- PROJECT SHIELDS -->

[![Contributors](https://img.shields.io/github/contributors/bcgov/nr-old-growth-integration)](/../../graphs/contributors)
[![Forks](https://img.shields.io/github/forks/bcgov/nr-old-growth-integration)](/../../network/members)
[![Stargazers](https://img.shields.io/github/stars/bcgov/nr-old-growth-integration)](/../../stargazers)
[![Issues](https://img.shields.io/github/issues/bcgov/nr-old-growth-integration)](/../../issues)
[![MIT License](https://img.shields.io/github/license/bcgov/nr-old-growth-integration.svg)](/LICENSE.md)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

The Old Growth Technical Advisory Panel identified old growth areas that are at imminent risk of harvest. The current deferral process could require that licensees do a field verification to confirm, add or delete areas meeting the definition of old growth trees. The Old Growth project amis to help automate that process and enable the tracking and managing of the potential deferral areas and any decisions that come out of that process that may impact licensees.

# Overview

The nr-old-growth is a node.js application built with [nestJS](https://docs.nestjs.com), integrated with the [greenfield-template](https://github.com/bcgov/greenfield-template) to automate the process for testing, security scanning, code quality checking, image building and deploying. For the fist version of the Old Growth project, we use [CHEFS](https://bcgov.github.io/common-service-showcase/services/chefs.html) to manage the submission and review of the field verification form. The nr-old-growth applicatin is developed based on the [CHEFS API](https://chefs.nrs.gov.bc.ca/app/api/v1/docs#operation/listSubmissions), that provides an notification system to notify the selected natural resource district office whenever there is a new submission. Using a postgres database to track notification delivery status of submissions and any error log messages.

# Setup

Please check the Readme in the backup folder. Version 1 of the nr-old-growth application only uses the form servies in the backend folder, the rest service code, frontend code are just placeholders for version 2 if needed in the future.

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
