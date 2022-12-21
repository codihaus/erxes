import * as strip from 'strip';
import axios from 'axios';
import * as request from 'request-promise';
import { generateModels } from '../../models';
import { debug } from '../../configs';
import { userIds } from '../middlewares/userMiddleware';
import { createOrUpdateConversation } from '../controllers';
import { zaloSend } from '../../zalo';
import { generateAttachmentUrl } from '../../utils';

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

      console.log('data from response form:', data);

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
          console.log('start generateAttachmentUrl: ');
          for (const attachment of attachments) {
            let attachmentUrl = generateAttachmentUrl(attachment.url);
            // let file = await axios.get(attachmentUrl)
            let file = await request
              .get({ url: 'http://localhost:3000' + attachmentUrl })
              .then(res => res);
            console.log('generateAttachmentUrl: ', attachmentUrl);
            console.log('file generateAttachmentUrl: ', file);
          }
          response.status = 'success';
          return;

          // const uploadImage = await zaloSend('upload/image', )

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
