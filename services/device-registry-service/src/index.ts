import { ApolloServer } from 'apollo-server';
import * as types from './schema';
import { makeSchema } from 'nexus';
import { join } from 'path';
import { Store } from 'store';

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
});

const server = new ApolloServer({
  schema,
  context: {
    store: new Store('device_db'),
  },
});

server.listen({ port: 4000 }).then(() => {
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
});
