import { IModels } from '../../models';
import { sendInboxMessage } from '../brokers';
import { debug } from '../../configs';
import { zaloGet } from '../../zalo';
const querystring = require('querystring');

export const createOrUpdateCustomer = async (
  models: IModels,
  subdomain: any,
  data: any = {}
) => {
  const integrationId = data?.integrationId;
  const oa_id = data?.oa_id;

  delete data.integrationId;
  delete data.oa_id;

  let hasData = Object.keys(data).length > 1;

  let customer = await models.Customers.findOne({
    userId: data.userId
  });

  // debug.error(`customer data: ${data.userID}`)

  if (customer) {
    return customer;
  }

  if (oa_id) {
    const zaloUser: any = await zaloGet(
      `conversation?data=${JSON.stringify({
        user_id: data.userId,
        offset: 0,
        count: 1
      })}`,
      { models, oa_id }
    );

    let {
      src,
      from_id,
      to_id,
      from_display_name,
      to_display_name,
      from_avatar,
      to_avatar
    } = zaloUser?.data?.[0];

    const userId = src ? from_id : to_id;
    const firstName = src ? from_display_name : to_display_name;
    const avatar = src ? from_avatar : to_avatar;

    data = {
      ...data,
      firstName: firstName,
      integrationId,
      profilePic: avatar
    };
    // debug.error(`zaloUser: ${JSON.stringify(zaloUser)}`)
    // debug.error(`zaloUser data: ${JSON.stringify(data)}`)
  }

  try {
    customer = await models.Customers.create(data);
  } catch (e) {
    throw new Error(
      e.message.includes('duplicate')
        ? 'Concurrent request: customer duplication'
        : e
    );
  }

  // debug.error(`before apiCustomerResponse`)

  // save on api
  try {
    const apiCustomerResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          ...data,
          avatar: data.profilePic,
          isUser: true
        })
      },
      isRPC: true
    });

    debug.error(`apiCustomerResponse: ${JSON.stringify(apiCustomerResponse)}`);

    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    // await models.Customers.deleteOne({ _id: customer._id });

    debug.error(`apiCustomerResponse error: ${e.message}`);
  }

  return customer;
};
