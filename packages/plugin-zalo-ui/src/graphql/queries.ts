const zaloGetConfigs = `
  query zaloGetConfigs {
    zaloGetConfigs
  }
`;

const detail = `
  query zalo($conversationId: String!) {
      zaloConversationDetail(conversationId: $conversationId) {
          _id
          mailData
      }
  }
`;

const accounts = `
  query zaloGetAccounts {
    zaloGetAccounts 
  }
`;

const zaloConversationMessages = `
  query zaloConversationMessages(
    $conversationId: String!
    $skip: Int
    $limit: Int
    $getFirst: Boolean
  ) {
    zaloConversationMessages(
      conversationId: $conversationId,
      skip: $skip,
      limit: $limit,
      getFirst: $getFirst
    ) {
      _id
      content
      conversationId
      customerId
      userId
      createdAt
      isCustomerRead
      attachments
    }
  }
`;

const zaloConversationMessagesCount = `
  query zaloConversationMessagesCount($conversationId: String!) {
    zaloConversationMessagesCount(conversationId: $conversationId)
  }
`;

export default {
  zaloGetConfigs,
  detail,
  accounts,
  zaloConversationMessages,
  zaloConversationMessagesCount
};
