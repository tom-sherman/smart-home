import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import { Dao } from './dao';
import * as z from 'zod';

export interface APIDependencies {
  dao: Dao;
}

const router = new Router<
  {},
  { deps: APIDependencies; request: { body: any } }
>();

router.get('/', (ctx, next) => {
  ctx.body = 'OK';
  ctx;
});

router.get('/device/:id', async (ctx) => {
  const id = ctx.params.id;
  const device = await ctx.deps.dao.getDevice(id);

  if (!device) {
    return;
  }

  ctx.body = device.bridgeDevice;
});

const patchDeviceSchema = z.object({});
router.patch('/device/:id', async (ctx) => {
  console.log(ctx);
  ctx.body = ctx.request.body;
  return;
});

export function createApi(dependencies: APIDependencies) {
  const app = new Koa()
    .use(bodyParser())
    .use(logger())
    .use(router.routes())
    .use(router.allowedMethods());

  app.context.deps = dependencies;

  return app;
}
