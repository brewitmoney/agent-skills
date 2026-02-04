#!/usr/bin/env node
/**
 * Send a token to multiple recipients in one transaction
 * Usage: node batch-send-token.js <token> <recipient1:amount1> <recipient2:amount2> ...
 * Example: node batch-send-token.js USDC 0xAddr1:0.1 0xAddr2:0.2
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
  const [tokenSymbol, ...recipients] = process.argv.slice(2);

  if (!tokenSymbol || recipients.length === 0) {
    console.error('Usage: node batch-send-token.js <token> <recipient1:amount1> <recipient2:amount2> ...');
    console.error('Example: node batch-send-token.js USDC 0xAddr1:0.1 0xAddr2:0.2');
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
  console.log('Token:', tokenSymbol.toUpperCase());
  console.log('\nRecipients:');

  const calls = recipients.map(item => {
    const [to, amount] = item.split(':');
    console.log(`  → ${to}: ${amount} ${tokenSymbol.toUpperCase()}`);

    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to, parseUnits(amount, token.decimals)],
    });

    return {
      to: token.address,
      value: 0n,
      data: data,
    };
  });

  console.log(`\nSending ${calls.length} transfers in 1 transaction...`);
  const client = createAccountClient(account, bundlerUrl);

  const tx = await client.sendTransaction({
    account: account,
    calls: calls,
  });

  console.log('\n✅ Batch transaction sent!');
  console.log('TX Hash:', tx);
  console.log('View:', `https://basescan.org/tx/${tx}`);
}

main().catch(console.error);
