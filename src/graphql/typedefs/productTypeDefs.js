const { gql } = require('apollo-server-express');

const productTypeDefs = gql`
  type Image {
    url: String!
    publicId: String
  }

  type CareLight {
    value: String
    description: String
  }

  type CareWatering {
    value: String
    description: String
  }

  type CareTemp {
    value: String
    range: String
    description: String
  }

  type Care {
    light: CareLight
    watering: CareWatering
    temp: CareTemp
  }

  type Product {
    id: ID!
    name: String!
    slug: String!
    shortDesc: String
    description: String
    price: Float!
    compareAtPrice: Float
    images: [Image!]!
    categories: [String!]!
    badges: [String!]!
    care: Care
    size: String
    dimensions: String
    potRecommended: String
    stock: Int!
    ratingAvg: Float
    ratingCount: Int
    salesCount: Int
    isFeatured: Boolean
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    products(limit: Int, skip: Int, category: String): [Product!]!
    productById(id: ID!): Product
    productBySlug(slug: String!): Product
    productsByCategory(category: String!): [Product!]!
    featuredProducts(limit: Int): [Product!]!
    searchProducts(query: String!): [Product!]!
  }
`;

module.exports = productTypeDefs;
