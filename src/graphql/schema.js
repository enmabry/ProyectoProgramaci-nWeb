const { gql } = require('apollo-server-express');
const productTypeDefs = require('./typedefs/productTypeDefs');
const orderTypeDefs = require('./typedefs/orderTypeDefs');

const baseTypeDefs = gql`
  type Query {
    hello: String
  }

  type Mutation {
    _empty: String
  }
`;

const typeDefs = [baseTypeDefs, productTypeDefs, orderTypeDefs];

module.exports = typeDefs;
