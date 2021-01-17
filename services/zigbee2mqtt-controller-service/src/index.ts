import config from '../config.json';
import MQTT, { AsyncMqttClient } from 'async-mqtt';
import { Store } from 'store';

const client = MQTT.connect(config.mqttHost);

client.on('connect', async () => {
  const [msg] = await client.subscribe('zigbee2mqtt/bridge/devices');

  console.log(msg);
});
