import * as strip from 'strip';
import { generateModels } from '../../models';
import { debug } from '../../configs';
import { userIds } from '../middlewares/userMiddleware';
import { createOrUpdateConversation } from '../controllers';
import { zaloSend } from '../../zalo';

export const conversationMessagesBroker = ({
  consumeRPCQueue,
  consumeQueue
}) => {
  consumeRPCQueue(
    'zalo:conversationMessages.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      debug.error(`zalo:conversationMessages.find: ${JSON.stringify(data)}`);

      return {
        status: 'success',
        data: await models.ConversationMessages.find(data).lean()
      };
    }
  );

  consumeRPCQueue(
    'zalo:api_to_integrations',

    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { action, type, payload } = data;
      const doc = JSON.parse(payload || '{}');

      let response: any = null;

      console.log(data);

      try {
        if (type === 'zalo') {
          const {
            integrationId,
            conversationId,
            content = '',
            attachments = [],
            extraInfo
          } = doc;

          const conversation = await models.Conversations.getConversation({
            erxesApiId: conversationId
          });

          const { recipientId, senderId } = conversation;

          const messageSent = await zaloSend(
            'message',
            {
              recipient: {
                user_id: senderId
              },
              message: {
                text: strip(content)
              }
            },
            { models, oa_id: recipientId }
          );

          console.log('messageSent', messageSent);

          const localMessage = await models.ConversationMessages.addMessage(
            {
              ...doc,
              content: strip(content),
              // inbox conv id comes, so override
              conversationId: conversation._id,
              mid: messageSent?.data?.message_id
            },
            doc.userId
          );

          response = {
            data: localMessage.toObject()
          };
        }

        response.status = 'success';
      } catch (e) {
        response = {
          status: 'error',
          errorMessage: e.message
        };
      }

      return response;
    }
  );

  consumeQueue('zalo:notification', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { payload, type } = data;

    console.log('zalo:notification', data);

    switch (type) {
      case 'addUserId':
        userIds.push(payload._id);
        break;
      default:
        break;
    }
  });
};
