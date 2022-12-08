import { gql } from 'apollo-server-express';

const types = `
  type Zalo {
    _id: String!
    title: String
    mailData: JSON
  }
  type ZaloConversationMessage {
    _id: String!
    content: String
    conversationId: String
    fromBot: Boolean
    botData: JSON
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    mid: String
  }
`;

const queries = `
  zaloGetConfigs: JSON
  zaloAccounts: JSON
  zaloGetAccounts: JSON
  zaloConversationMessages(conversationId: String! skip: Int limit: Int getFirst: Boolean): [ZaloConversationMessage]
  zaloConversationMessagesCount(conversationId: String!): Int
  zaloConversationDetail(conversationId: String!): [Zalo]
`;

const mutations = `
  zaloUpdateConfigs(configsMap: JSON!): JSON
  zaloRemoveAccount(_id: String!): String
`;

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${types}

  extend type Query {
    ${queries}
  }

  extend type Mutation {
    ${mutations}
  }
`;

export default typeDefs;
