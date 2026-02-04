import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(resolve(__dirname, '..', '.env'));

const PIMLICO_API_KEY = process.env.PIMLICO_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PIMLICO_API_KEY) {
  console.error('Error: PIMLICO_API_KEY not set in .env file');
  process.exit(1);
}

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY not set in .env file');
  process.exit(1);
}

export { PIMLICO_API_KEY, PRIVATE_KEY };
