/**
Copyright 2016 Split Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/

'use strict';

const Logger = require('logplease');
const timer = require('../../tracker/Timer');

const CONSTANTS = {
  SDK_READY: 'Getting ready - Split SDK',
  SPLITS_READY: 'Getting ready - Splits',
  SEGMENTS_READY: 'Getting ready - Segments',
  METRICS_PUSH: 'Pushing - Metrics',
  IMPRESSIONS_PUSH: 'Pushing - Impressions',
  SEGMENTS_FETCH: 'Fetching - My Segments',
  SPLITS_FETCH: 'Fetching - Splits'
};

const timers = {};

const logger = Logger.create('[TIME TRACKER]', {
  showTimestamp: false,
  showLevel: false,
  useColors: false
});

const TrackerAPI = {
  start(task) {
    // Create and start the timer, then save the reference.
    timers[task] = timer()();
  },
  stop(task) {
    const timer = timers[task];
    if (timer) {
      // Stop the timer and round result for readability.
      const et = Math.round( timer() );
      delete timers[task];
      logger.log(`[${task}] took ${et}ms to finish.`);
    }
  },
  C: CONSTANTS
};

// Our "time tracker" API
module.exports = TrackerAPI;
