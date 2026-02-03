#!/usr/bin/env node
/**
 * Create a Brewit smart account from a private key
 * Usage: node create-account.js <private-key>
 */

import { toAccount } from 'brewit/account';
import { privateKeyToAccount } from 'viem/accounts';

const CHAIN_ID = 8453;
const RPC_ENDPOINT = 'https://mainnet.base.org';

async function main() {
  const privateKey = process.argv[2];
  
  if (!privateKey) {
    console.error('Usage: node create-account.js <private-key>');
    process.exit(1);
  }

  console.log('Creating Brewit smart account...\n');

  const signer = privateKeyToAccount(privateKey);
  console.log('Signer (EOA):', signer.address);

  const account = await toAccount({
    chainId: CHAIN_ID,
    rpcEndpoint: RPC_ENDPOINT,
    signer: signer,
    type: 'main',
    config: { validator: 'ownable' },
  });

  console.log('\n✅ Smart Account Created!');
  console.log('Address:', account.address);
  console.log('Chain: Base (8453)');
  console.log('\nFund this address with USDC on Base to start transacting!');
}

main().catch(console.error);
