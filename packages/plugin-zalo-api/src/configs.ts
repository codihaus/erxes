import { getSubdomain } from "@erxes/api-utils/src/core";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";

// import { initBroker } from "./messageBroker";
// import init from "./controller";
import { generateModels } from "./models";
import { initMemoryStorage, initBroker, createRoutes } from "./server";

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
    name: "zalo",
    graphql: (sd) => {
        serviceDiscovery = sd;
        return {
            typeDefs,
            resolvers,
        };
    },
    meta: {
        inboxIntegration: {
            kind: "zalo",
            label: "Zalo",
        },
    },
    apolloServerContext: async (context, req) => {
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        context.subdomain = req.hostname;
        context.models = models;
        return context;
    },

    onServerInit: async (options) => {
        const app = options.app;
        mainDb = options.db;

        debug = options.debug;
        graphqlPubsub = options.pubsubClient;

        initMemoryStorage();
        initBroker(options.messageBrokerClient);
        createRoutes(app);

    },
};
