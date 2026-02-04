/**
 * Token registry for Base network.
 * Add new tokens here to make them available to all scripts.
 */

const TOKENS = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
  },
  USDT: {
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    decimals: 6,
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
  },
};

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

function getToken(symbol) {
  const token = TOKENS[symbol.toUpperCase()];
  if (!token) {
    const supported = Object.keys(TOKENS).join(', ');
    console.error(`Unknown token: ${symbol}`);
    console.error(`Supported tokens: ${supported}`);
    process.exit(1);
  }
  return token;
}

export { TOKENS, ERC20_ABI, getToken };
