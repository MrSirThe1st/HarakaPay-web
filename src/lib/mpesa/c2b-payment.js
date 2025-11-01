import { MpesaClient } from './mpesa-client';

export async function initiateC2BPayment({
  customerMSISDN,    // Parent's phone number (format: 243XXXXXXXXX for Congo)
  amount,            // Payment amount
  studentId,         // Your student reference
  parentId,          // Your parent reference
  feeAssignmentId,   // Reference to student_fee_assignment
  description        // Payment description
}) {
  console.log('🔄 MPesa: Starting C2B payment initiation...');
  console.log('🔄 MPesa: Payment details:', { customerMSISDN, amount, studentId, description });
  
  const client = new MpesaClient();
  
  // Check if MPesa credentials are available
  if (!client.apiKey || !client.publicKey) {
    console.log('❌ MPesa: Missing credentials');
    throw new Error('MPesa credentials not configured');
  }
  
  // Step 1: Get Session Key
  console.log('🔄 MPesa: Generating session key...');
  const sessionKey = await client.generateSessionKey();
  console.log('✅ MPesa: Session key generated:', sessionKey ? '***' : 'FAILED');
  
  // Wait 30 seconds for session to become active (M-Pesa requirement)
  console.log('⏳ MPesa: Waiting 30 seconds for session activation...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  console.log('✅ MPesa: Session activation wait complete');
  
  // Step 2: Encrypt Session Key
  const encryptedSessionKey = client.encryptSessionKey(sessionKey);
  
  // Step 3: Generate unique transaction reference
  const transactionRef = `HP-${Date.now()}-${studentId.slice(-4)}`;
  const thirdPartyConversationID = `${parentId}-${Date.now()}`;
  
  // Step 4: Make C2B Payment Request
  const paymentPayload = {
    input_Amount: amount.toString(),
    input_CustomerMSISDN: customerMSISDN,
    input_Country: process.env.MPESA_COUNTRY,
    input_Currency: process.env.MPESA_CURRENCY,
    input_ServiceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
    input_TransactionReference: transactionRef,
    input_ThirdPartyConversationID: thirdPartyConversationID,
    input_PurchasedItemsDesc: description
  };

  console.log('🔄 MPesa: C2B Payment Request Payload:', paymentPayload);

  const response = await fetch(
    `${client.baseUrl}/ipg/v2/${client.market}/c2bPayment/singleStage/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${encryptedSessionKey}`,
        'Origin': process.env.MPESA_ORIGIN
      },
      body: JSON.stringify(paymentPayload)
    }
  );

  const data = await response.json();

  console.log('📥 MPesa: C2B Payment Response:', JSON.stringify(data, null, 2));
  console.log('📥 MPesa: Response Code:', data.output_ResponseCode);
  console.log('📥 MPesa: Response Description:', data.output_ResponseDesc);

  return {
    success: data.output_ResponseCode === 'INS-0',
    transactionId: data.output_TransactionID,
    conversationId: data.output_ConversationID,
    thirdPartyConversationId: data.output_ThirdPartyConversationID,
    responseCode: data.output_ResponseCode,
    responseDesc: data.output_ResponseDesc,
    transactionRef,
    amount,
    customerMSISDN,
    rawResponse: data // Include full response for debugging
  };
}