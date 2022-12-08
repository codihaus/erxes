import { IModels } from "../../models";
import { sendInboxMessage } from "../brokers/sendMessage";
import { debug } from '../../configs'
import { zaloGet } from "../../zalo";
const querystring = require('querystring')

export const createOrUpdateCustomer = async (models:IModels, subdomain: any, data: any = {}) => {

    const integrationId = data?.integrationId
    const oa_id = data?.oa_id

    delete data.integrationId
    delete data.oa_id

    // debug.error(`createOrUpdateCustomer data: ${JSON.stringify({...data, oa_id})}`)

    let hasData = Object.keys(data).length > 1

    let customer = await models.Customers.findOne({
        userID: data?.userID,
    });

    // debug.error(`customer data: ${JSON.stringify(customer)}`)

    if (customer) {
        return await models.Customers.updateOne(
            { _id: customer._id },
            {
                $set: data,
            }
        )
    }

    if( oa_id ) {
        const zaloUser: any = await zaloGet(`getprofile?data=${JSON.stringify({ user_id: data.userId })}`, { models, oa_id })
        data = {
            ...data,
            firstName: zaloUser?.data?.display_name,
            integrationId,
            profilePic: zaloUser?.data?.avatar,
        }
        // debug.error(`zaloUser: ${JSON.stringify(data)}`)

    }

    try {
        customer = await models.Customers.create(data);
    } catch (e) {
        throw new Error(
            e.message.includes("duplicate")
                ? "Concurrent request: customer duplication"
                : e
        );
    }

    console.log(`before apiCustomerResponse`)

    // save on api
    try {
        const apiCustomerResponse = await sendInboxMessage({
            subdomain,
            action: "integrations.receive",
            data: {
                action: "get-create-update-customer",
                payload: JSON.stringify({
                    ...data,
                    avatar: data.profilePic,
                    isUser: true,
                }),
            },
            isRPC: true,
        });

        console.log(`apiCustomerResponse: ${apiCustomerResponse}`)

        customer.erxesApiId = apiCustomerResponse._id;
        await customer.save();
    } catch (e) {
        await models.Customers.deleteOne({ _id: customer._id });
        
        // debug.error(`apiCustomerResponse: ${e.message}`);
    }

    return customer
}