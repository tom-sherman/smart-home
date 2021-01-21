import config from '../config.json';
import MQTT from 'async-mqtt';
import { createHandlers } from './handlers';
import { Dao } from './dao';
import { Store } from 'store';
import { createApi } from './api';

const client = MQTT.connect(config.mqttHost, {
  // clientId: 'zigbee.service' + Math.random(),
});

const dependencyContainer = {
  rootTopic: 'zigbee2mqtt',
  dao: new Dao(new Store('service_store')),
  controllerName: 'service.controller.zigbee2mqtt',
  deviceRegistryEndpoint: 'http://localhost:4000',
  mqtt: client,
};

const handlers = createHandlers(dependencyContainer);

client.on('connect', async () => {
  await Promise.all(
    handlers.map(({ topic }) => {
      console.log('Subscribing to', topic);
      return client.subscribe(topic);
    })
  );
  console.log('Done: Subscribing to topics');
});

client.on('message', (topic, payload) => {
  for (const { handler } of handlers) {
    handler(topic, payload);
  }
});

createApi(dependencyContainer).listen(4001, () => {
  console.log('Server started');
});
