'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DEFLAKE_DELAY_IN_MILLISECONDS =
  exports.DEFAULT_POLLING_MAX_WAITING_SECONDS =
  exports.DEFAULT_POLLING_INTERVAL_SECONDS =
  exports.ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS =
  exports.ENVIRONMENT_STOP_MAX_WAITING_SECONDS =
  exports.ENVIRONMENT_START_MAX_WAITING_SECONDS =
    void 0;
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
//Average start waiting time is 5 minutes, setting start max waiting to 10 minutes
exports.ENVIRONMENT_START_MAX_WAITING_SECONDS = 600;
//Average start waiting time is 2 minutes, setting start max waiting to 4 minutes
exports.ENVIRONMENT_STOP_MAX_WAITING_SECONDS = 240;
//Average start waiting time is 1:30 minutes, setting start max waiting to 3 minutes
exports.ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS = 180;
exports.DEFAULT_POLLING_INTERVAL_SECONDS = 15;
exports.DEFAULT_POLLING_MAX_WAITING_SECONDS = 600;
exports.DEFLAKE_DELAY_IN_MILLISECONDS = 2000;
//# sourceMappingURL=constants.js.map
