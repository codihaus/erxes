import { intergrationBroker } from './intergration'


let client;

export const initBroker = async cl => {
    client = cl;
    
    const { consumeRPCQueue } = client;
    
    intergrationBroker(consumeRPCQueue)
}

export default function() {
    return client;
}

export * from './sendMessage'