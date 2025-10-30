import { MpesaClient } from './mpesa-client';

export async function initiateC2BPayment({
  customerMSISDN,    // Parent's phone number (format: 243XXXXXXXXX for Congo)
  amount,            // Payment amount
  studentId,         // Your student reference
  parentId,          // Your parent reference
  feeAssignmentId,   // Reference to student_fee_assignment
  description        // Payment description
}) {
  const client = new MpesaClient();
  
  // Step 1: Get Session Key
  const sessionKey = await client.generateSessionKey();
  
  // Wait 30 seconds for session to become active (M-Pesa requirement)
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Step 2: Encrypt Session Key
  const encryptedSessionKey = client.encryptSessionKey(sessionKey);
  
  // Step 3: Generate unique transaction reference
  const transactionRef = `HP-${Date.now()}-${studentId.slice(-4)}`;
  const thirdPartyConversationID = `${parentId}-${Date.now()}`;
  
  // Step 4: Make C2B Payment Request
  const response = await fetch(
    `${client.baseUrl}/ipg/v2/${client.market}/c2bPayment/singleStage/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${encryptedSessionKey}`,
        'Origin': process.env.MPESA_ORIGIN
      },
      body: JSON.stringify({
        input_Amount: amount.toString(),
        input_CustomerMSISDN: customerMSISDN,
        input_Country: process.env.MPESA_COUNTRY,
        input_Currency: process.env.MPESA_CURRENCY,
        input_ServiceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
        input_TransactionReference: transactionRef,
        input_ThirdPartyConversationID: thirdPartyConversationID,
        input_PurchasedItemsDesc: description
      })
    }
  );
  
  const data = await response.json();
  
  return {
    success: data.output_ResponseCode === 'INS-0',
    transactionId: data.output_TransactionID,
    conversationId: data.output_ConversationID,
    thirdPartyConversationId: data.output_ThirdPartyConversationID,
    responseCode: data.output_ResponseCode,
    responseDesc: data.output_ResponseDesc,
    transactionRef,
    amount,
    customerMSISDN
  };
}