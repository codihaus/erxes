module.exports = {
  name: 'zalo',
  scope: 'zalo',
  port: 3024,
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/containers/IntergrationConfigs.tsx',
    './inboxConversationDetail': './src/components/ConversationDetail.tsx'
  },
  routes: {
    url: 'http://localhost:3024/remoteEntry.js',
    scope: 'zalo',
    module: './routes'
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxConversationDetail: './inboxConversationDetail',
  inboxIntegration: {
    name: 'Zalo',
    description:
      'Please write integration description on plugin config file',
    isAvailable: true,
    kind: 'zalo',
    logo: '/images/integrations/zalo.png',
    createUrl: '/settings/integrations/createZalo',
    category:
      'All integrations, For support teams, Marketing automation, Email marketing'
  }
};
