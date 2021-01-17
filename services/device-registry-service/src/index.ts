import { ApolloServer } from 'apollo-server';
import * as types from './schema';
import { makeSchema } from 'nexus';
import { join } from 'path';
import { Store } from 'store';
import { ContextType } from './context';
import { DeviceStore } from './device-store';

const schema = makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, 'generated', 'nexus-typegen.ts'), // 2
    schema: join(__dirname, 'generated', 'schema.graphql'), // 3
  },
  sourceTypes: {
    modules: [{ module: join(__dirname, 'sourceTypes.ts'), alias: 't' }],
  },
  contextType: {
    module: join(__dirname, 'context.ts'),
    export: 'ContextType',
  },
  prettierConfig: {
    semi: true,
    singleQuote: true,
  },
});

const context: ContextType = {
  store: new DeviceStore(new Store('device_db')),
};

const server = new ApolloServer({
  schema,
  context,
  tracing: true,
});

server.listen({ port: 4000 }).then(() => {
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
});
