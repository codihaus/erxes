import { generateModels } from '../../models';
import { removeIntegration, zaloCreateIntegration } from '../controllers';

export const integrationBroker = ({ consumeRPCQueue }) => {
  consumeRPCQueue(
    'zalo:createIntegration',
    async ({ subdomain, data: { doc, kind } }) => {
      const models = await generateModels(subdomain);

      if (kind === 'zalo') {
        return zaloCreateIntegration(models, subdomain, doc);
      }

      return {
        status: 'error',
        data: 'Wrong kind'
      };
    }
  );

  consumeRPCQueue(
    'zalo:removeIntegration',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);
      await removeIntegration(models, integrationId);
      return {
        status: 'success'
      };
    }
  );
};
