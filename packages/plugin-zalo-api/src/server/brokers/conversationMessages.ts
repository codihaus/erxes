import { generateModels } from "../../models";

export const intergrationBroker = (consumeRPCQueue) => {
    consumeRPCQueue(
        "zalo:conversationMessages.find",
        async ({ subdomain, data }) => {
            const models = await generateModels(subdomain);

            return {
                status: "success",
                data: /* await models.ConversationMessages.find(data).lean() */ [],
            };
        }
    );
};
