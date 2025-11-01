// src/lib/mpesa/c2b-payment.js
// FIXED VERSION - Resolves INS-21 Parameter Validation Error

import { MpesaClient } from './mpesa-client';

export async function initiateC2BPayment({
  customerMSISDN,
  amount,
  studentId,
  parentId,
  feeAssignmentId,
  description
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
  
  // Step 3: Generate unique transaction references
  const timestamp = Date.now();

  // ✅ FIX 1: Transaction Reference - Max 20 chars, alphanumeric ONLY (no hyphens!)
  // Format: HP{timestamp}{studentID last 4 chars} = 19 chars
  // Example: HP176200608430013ee (19 chars)
  const transactionRef = `HP${timestamp}${studentId.slice(-4)}`;
  
  // ✅ FIX 2: ThirdPartyConversationID - Max 40 chars, alphanumeric only
  // Remove hyphens from UUID and keep it short
  // Old format: fabfb134-78d6-4ed3-b770-fa2a8655fbf1-1762003262003 (52 chars) ❌
  // New format: HP1762003262003a8655fbf1 (24 chars) ✅
  const shortParentId = parentId.replace(/-/g, '').slice(-10);  // Last 10 chars of UUID
  const thirdPartyConversationID = `HP${timestamp}${shortParentId}`;
  
  // Ensure it's within 40 characters
  if (thirdPartyConversationID.length > 40) {
    throw new Error(`ThirdPartyConversationID too long: ${thirdPartyConversationID.length} chars`);
  }
  
  console.log('🔄 MPesa: Generated IDs:', {
    transactionRef,
    transactionRefLength: transactionRef.length,
    thirdPartyConversationID,
    thirdPartyConversationIDLength: thirdPartyConversationID.length
  });
  
  // Step 4: Validate transaction reference length
  if (transactionRef.length > 20) {
    console.error('❌ Transaction reference too long:', transactionRef.length);
    throw new Error('Transaction reference exceeds 20 characters');
  }
  
  // Step 5: Prepare request payload
  const payload = {
    input_Amount: amount.toString(),
    input_CustomerMSISDN: customerMSISDN,
    input_Country: process.env.MPESA_COUNTRY,
    input_Currency: process.env.MPESA_CURRENCY,
    input_ServiceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
    input_TransactionReference: transactionRef,
    input_ThirdPartyConversationID: thirdPartyConversationID,
    input_PurchasedItemsDesc: description
  };
  
  // Log payload for debugging
  console.log('🔄 MPesa: C2B Payment Request Payload:', payload);
  console.log('🔄 MPesa: Payload validation:', {
    transactionRefValid: /^[0-9a-zA-Z]{1,20}$/.test(transactionRef),
    thirdPartyIDValid: /^[0-9a-zA-Z]{1,40}$/.test(thirdPartyConversationID),
    amountValid: /^\d*\.?\d+$/.test(amount.toString()),
    msisdnValid: /^[0-9]{12,14}$/.test(customerMSISDN)
  });
  
  // Step 6: Make C2B Payment Request
  const response = await fetch(
    `${client.baseUrl}/ipg/v2/${client.market}/c2bPayment/singleStage/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${encryptedSessionKey}`,
        'Origin': process.env.MPESA_ORIGIN
      },
      body: JSON.stringify(payload)
    }
  );
  
  const data = await response.json();
  
  console.log('📥 MPesa: C2B Payment Response:', JSON.stringify(data, null, 2));
  console.log('📥 MPesa: Response Code:', data.output_ResponseCode);
  console.log('📥 MPesa: Response Description:', data.output_ResponseDesc);
  
  // Check for common errors
  if (data.output_ResponseCode === 'INS-21') {
    console.error('❌ MPesa: Parameter validation failed');
    console.error('Check that all parameters match M-Pesa regex requirements');
    console.error('Transaction Reference length:', transactionRef.length, '(max 20)');
    console.error('ThirdParty ID length:', thirdPartyConversationID.length, '(max 40)');
  }
  
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