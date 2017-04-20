// @flow

'use strict';

const ClientFactory = require('./client');
const ManagerFactory = require('./manager');
const StorageFactory = require('./storage');

const FullProducerFactory = require('./producer');
const PartialProducerFactory = require('./producer/browser/Partial');

const OfflineProducerFactory = require('./producer/offline');

const MetricsFactory = require('./metrics');

const SettingsFactory = require('./utils/settings');

const ReadinessGateFacade = require('./readiness');

const keyParser = require('./utils/key/parser');

// cache instances created
const instances = {};

//
// Create SDK instance based on the provided configurations
//
function SplitFactory(settings: Settings, storage: SplitStorage, gateFactory: any,sharedInstance: ?boolean) {

  const readiness = gateFactory(settings.startup.readyTimeout);

  // We are only interested in exposable EventEmitter
  const { gate } = readiness;

  // Events name
  const {
    SDK_READY,
    SDK_UPDATE,
    SDK_READY_TIMED_OUT
  } = gate;

  let producer;
  let metrics;

  switch(settings.mode) {
    case 'localhost':
      producer = sharedInstance ? undefined : OfflineProducerFactory(settings, readiness, storage);
      break;
    case 'producer':
    case 'standalone': {
      // We don't fully instantiate metrics and producer if we are creating a shared instance.
      producer = sharedInstance ?
        PartialProducerFactory(settings, readiness, storage) :
        FullProducerFactory(settings, readiness, storage);
      metrics = sharedInstance ? undefined : MetricsFactory(settings, storage);
      break;
    }
    case 'consumer':
      break;
  }
  // Start background jobs tasks
  producer && producer.start();
  metrics && metrics.start();

  // Ready promise
  const readyFlag = sharedInstance ? Promise.resolve() :
    new Promise(resolve => gate.on(SDK_READY, resolve));

  const api = Object.assign(
    // Proto linkage of the EventEmitter to prevent any change
    Object.create(gate),
    // GetTreatment
    ClientFactory(settings, storage),
    // Utilities
    {
      // Ready promise
      ready() {
        return readyFlag;
      },

      // Events contants
      Event: {
        SDK_READY,
        SDK_UPDATE,
        SDK_READY_TIMED_OUT
      },

      // Destroy instance
      destroy() {
        readiness.destroy();

        producer && producer.stop();
        metrics && metrics.stop();
      }
    }
  );

  return api;
}

function SplitFacade(config: Object) {
  const settings = SettingsFactory(config);
  const storage = StorageFactory(settings);
  const gateFactory = ReadinessGateFacade();

  const defaultInstance = SplitFactory(settings, storage, gateFactory);

  return {

    // Split evaluation engine
    client(key: ?SplitKey): SplitClient {
      if (!key) return defaultInstance;

      if (typeof storage.shared != 'function') {
        throw 'Shared Client not supported by the storage mechanism. Create isolated instances instead.';
      }

      const parsedkey = keyParser(key);
      const instanceId = `${parsedkey.matchingKey}-${parsedkey.bucketingKey}`;

      if (!instances[instanceId]) {
        const sharedSettings = settings.overrideKey(key);
        instances[instanceId] = SplitFactory(sharedSettings, storage.shared(sharedSettings), gateFactory, true);
      }

      return instances[instanceId];
    },

    // Manager API to explore available information
    manager(): SplitManager {
      return ManagerFactory(storage.splits);
    },

    // Expose SDK settings
    settings
  };
}

module.exports = SplitFacade;
