# Zigbee2MQTT Controller

Communicates via https://www.zigbee2mqtt.io/ to a network of Zigbee devices.

## Registering and Unregistring devices

This process is mainly handled by the Zigbee protocol and zigbee2mqtt, all we need to do is subscribe to the `zigbee2mqtt/bridge/devices` topic to be notified when a device leaves or joins the network.

Messages received on this topic contain the full state of devices currently connected to the network.
