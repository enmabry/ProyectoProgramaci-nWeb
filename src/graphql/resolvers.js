const productResolvers = require('./resolvers/productResolvers');
const orderResolvers = require('./resolvers/orderResolvers');

const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
    ...productResolvers.Query,
    ...orderResolvers.Query
  },
  Mutation: {
    ...orderResolvers.Mutation
  }
};

module.exports = resolvers;
