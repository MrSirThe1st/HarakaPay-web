// This handles:
// 1. API Key encryption using RSA
// 2. Session Key generation
// 3. Making authenticated requests

import crypto from 'crypto';

export class MpesaClient {
  constructor() {
    this.apiKey = process.env.MPESA_API_KEY;
    this.publicKey = process.env.MPESA_PUBLIC_KEY;
    this.environment = process.env.MPESA_ENVIRONMENT;
    this.market = process.env.MPESA_MARKET;
    this.baseUrl = this.environment === 'sandbox' 
      ? 'https://openapi.m-pesa.com/sandbox'
      : 'https://openapi.m-pesa.com/openapi';
  }

  // Encrypt API Key with RSA public key
  encryptApiKey() {
    // Convert public key to PEM format if needed
    let publicKeyPem = this.publicKey;

    // If the key doesn't start with -----BEGIN, it might be base64 encoded or just the key content
    if (!publicKeyPem.includes('-----BEGIN')) {
      // Assume it's the base64 content without PEM headers, add them
      publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyPem}\n-----END PUBLIC KEY-----`;
    }

    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(this.apiKey)
    );
    return encrypted.toString('base64');
  }

  // Generate Session Key (Step 1 of every transaction)
  async generateSessionKey() {
    const encryptedApiKey = this.encryptApiKey();
    
    const response = await fetch(
      `${this.baseUrl}/ipg/v2/${this.market}/getSession/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${encryptedApiKey}`,
          'Origin': process.env.MPESA_ORIGIN
        }
      }
    );

    const data = await response.json();
    
    if (data.output_ResponseCode === 'INS-0') {
      return data.output_SessionID;
    }
    
    throw new Error(`Session generation failed: ${data.output_ResponseDesc}`);
  }

  // Encrypt Session Key for subsequent requests
  encryptSessionKey(sessionKey) {
    // Convert public key to PEM format if needed
    let publicKeyPem = this.publicKey;

    // If the key doesn't start with -----BEGIN, it might be base64 encoded or just the key content
    if (!publicKeyPem.includes('-----BEGIN')) {
      // Assume it's the base64 content without PEM headers, add them
      publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyPem}\n-----END PUBLIC KEY-----`;
    }

    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(sessionKey)
    );
    return encrypted.toString('base64');
  }
}