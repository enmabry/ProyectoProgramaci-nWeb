const { gql } = require('apollo-server-express');

const orderTypeDefs = gql`
  scalar DateTime

  type OrderItem {
    productId: ID!
    productName: String!
    quantity: Int!
    price: Float!
    subtotal: Float!
  }

  type ShippingAddress {
    fullName: String!
    phone: String!
    address: String!
    city: String!
    postalCode: String!
    country: String
  }

  type Order {
    id: ID!
    userId: ID!
    items: [OrderItem!]!
    subtotal: Float!
    tax: Float
    shippingCost: Float
    total: Float!
    status: String!
    shippingAddress: ShippingAddress!
    paymentMethod: String!
    paymentStatus: String!
    notes: String
    confirmedAt: DateTime
    shippedAt: DateTime
    deliveredAt: DateTime
    cancelledAt: DateTime
    createdAt: DateTime
    updatedAt: DateTime
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input ShippingAddressInput {
    fullName: String!
    phone: String!
    address: String!
    city: String!
    postalCode: String!
    country: String
  }

  extend type Query {
    orders(status: String, limit: Int, skip: Int): [Order!]!
    orderById(id: ID!): Order
    userOrders(userId: ID!, limit: Int, skip: Int): [Order!]!
  }

  extend type Mutation {
    createOrder(
      items: [OrderItemInput!]!
      shippingAddress: ShippingAddressInput!
      paymentMethod: String!
      notes: String
    ): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
    cancelOrder(id: ID!): Order!
  }
`;

module.exports = orderTypeDefs;
