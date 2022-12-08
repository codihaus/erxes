const zaloUpdateConfigs = `
  mutation zaloUpdateConfigs($configsMap: JSON!) {
    zaloUpdateConfigs(configsMap: $configsMap)
  }
`;

const removeAccount = `
  mutation zaloAccountRemove($_id: String!) {
    zaloAccountRemove(_id: $_id)
  }
`;

export default {
  zaloUpdateConfigs,
  removeAccount
};
