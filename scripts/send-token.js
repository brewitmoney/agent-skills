#!/usr/bin/env node
/**
 * Send an ERC-20 token using Brewit smart account
 * Usage: node send-token.js <token> <recipient> <amount>
 * Example: node send-token.js USDC 0xRecipient 0.1
 */

import { toAccount } from 'brewit/account';
import { createAccountClient } from 'brewit';
import { privateKeyToAccount } from 'viem/accounts';
import { encodeFunctionData, parseUnits } from 'viem';
import { PRIVATE_KEY, PIMLICO_API_KEY } from './config.js';
import { ERC20_ABI, getToken } from './tokens.js';

const CHAIN_ID = 8453;
const RPC_ENDPOINT = 'https://mainnet.base.org';

async function main() {
  const [tokenSymbol, recipient, amount] = process.argv.slice(2);

  if (!tokenSymbol || !recipient || !amount) {
    console.error('Usage: node send-token.js <token> <recipient> <amount>');
    console.error('Example: node send-token.js USDC 0xRecipient 0.1');
    process.exit(1);
  }

  const token = getToken(tokenSymbol);

  const bundlerUrl = `https://api.pimlico.io/v2/${CHAIN_ID}/rpc?apikey=${PIMLICO_API_KEY}`;
  const signer = privateKeyToAccount(PRIVATE_KEY);

  console.log('Creating Brewit account...');
  const account = await toAccount({
    chainId: CHAIN_ID,
    rpcEndpoint: RPC_ENDPOINT,
    signer: signer,
    type: 'main',
    config: { validator: 'ownable' },
  });

  console.log('From:', account.address);
  console.log('To:', recipient);
  console.log('Amount:', amount, tokenSymbol.toUpperCase(), '\n');

  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [recipient, parseUnits(amount, token.decimals)],
  });

  console.log('Sending transaction...');
  const client = createAccountClient(account, bundlerUrl);

  const tx = await client.sendTransaction({
    account: account,
    to: token.address,
    value: 0n,
    data: data,
  });

  console.log('\n✅ Transaction sent!');
  console.log('TX Hash:', tx);
  console.log('View:', `https://basescan.org/tx/${tx}`);
}

main().catch(console.error);
