import { MpesaClient } from './mpesa-client';

export async function queryTransactionStatus(transactionId) {
  const client = new MpesaClient();
  const sessionKey = await client.generateSessionKey();
  await new Promise(resolve => setTimeout(resolve, 30000));
  const encryptedSessionKey = client.encryptSessionKey(sessionKey);
  
  const response = await fetch(
    `${client.baseUrl}/ipg/v2/${client.market}/queryTransactionStatus/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${encryptedSessionKey}`,
        'Origin': process.env.MPESA_ORIGIN
      },
      body: JSON.stringify({
        input_QueryReference: transactionId,
        input_Country: process.env.MPESA_COUNTRY,
        input_ServiceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
        input_ThirdPartyConversationID: `query-${Date.now()}`
      })
    }
  );
  
  return await response.json();
}