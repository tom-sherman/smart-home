# Smart Home

> Microservices to run my smart home network.

## Is this production ready?

No, and it never will be - sorry! It's a set of services that I use to run my IoT devices, these are very specific to the hardware and infra I run the network on. This infra is unfortunately not managed with code.

In the future, if I ever find the time, I may investigate using infra-as-code to easily deploy these services to a Raspberry Pi cluster. No promises though!

## Services

Services like in the `/services` directory.

### device-registry

This service manages which devices are connected to the network, what capabilities they have, and what controller (more on these later) controls them.

### Controllers

By convention these have names that follow the format `{NAME}-controller-service`, they know how get and update state of IoT devices of a particular protocol.

## Libraries

Code that's shared across many services lives in `/lib`.
