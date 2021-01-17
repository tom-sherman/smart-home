import config from '../config.json';
import MQTT from 'async-mqtt';
import { createHandlers } from './handlers';
import { Dao } from './dao';
import { Store } from 'store';

const client = MQTT.connect(config.mqttHost, {
  // clientId: 'zigbee.service' + Math.random(),
});

const handlers = createHandlers({
  rootTopic: 'zigbee2mqtt',
  dao: new Dao(new Store('service_store')),
  controllerName: 'service.controller.zigbee2mqtt',
  deviceRegistryEndpoint: 'http://localhost:4000',
});

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
