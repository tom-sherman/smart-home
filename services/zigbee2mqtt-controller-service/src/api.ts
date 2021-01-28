import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import { Dao } from './dao';
import * as z from 'zod';
import { AsyncMqttClient } from 'async-mqtt';

export interface APIDependencies {
  dao: Dao;
  mqtt: AsyncMqttClient;
  rootTopic: string;
}

const router = new Router<
  {},
  { deps: APIDependencies; request: { body: any } }
>();

router.get('/', (ctx, next) => {
  ctx.body = 'OK';
});

router.get('/device/:id', async (ctx) => {
  const id = ctx.params.id;
  const device = await ctx.deps.dao.getDevice(id);

  if (!device) {
    return;
  }

  ctx.body = device.bridgeDevice;
});

const patchDeviceSchema = z.union([
  z.object({
    actionType: z.literal('binary'),
    property: z.string(),
    action: z.union([z.literal('ON'), z.literal('OFF'), z.literal('TOGGLE')]),
  }),
  z.object({
    actionType: z.literal('numeric'),
    property: z.string(),
    action: z.number(),
  }),
]);
router.patch('/device/:id', async (ctx) => {
  const id = ctx.params.id;
  const device = await ctx.deps.dao.getDevice(id);

  if (!device) {
    return;
  }

  const result = patchDeviceSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.body = {
      error: result.error.errors,
    };
    return;
  }

  switch (result.data.actionType) {
    case 'binary': {
      ctx.deps.mqtt.publish(
        `${ctx.deps.rootTopic}/${device.bridgeDevice.friendly_name}/set`,
        // TODO: data.action may not match the value we need to send in the channel
        // eg ON = true, OFF = false, TOGGLE = 2
        JSON.stringify({
          [result.data.property]: result.data.action,
        })
      );

      return (ctx.body = {
        ok: true,
      });
    }

    default: {
      throw new Error(`Unhandled actionType ${result.data.actionType}`);
    }
  }
});

export function createApi(dependencies: APIDependencies) {
  const app = new Koa();
  app.context.deps = dependencies;
  app
    .use(bodyParser())
    .use(logger())
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
}
