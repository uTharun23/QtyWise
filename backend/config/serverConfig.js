import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to resolve absolute path from relative path
const resolvePath = (relativeOrAbsolute) => {
  if (path.isAbsolute(relativeOrAbsolute)) {
    return relativeOrAbsolute;
  }
  return path.resolve(path.join(__dirname, '..', relativeOrAbsolute));
};

const serverConfig = {
  port: parseInt(process.env.PORT, 10) || 5001,
  env: process.env.NODE_ENV || 'development',
  masterDataPath: resolvePath(process.env.MASTER_DATA_PATH || '../dataset/ap_master_dataset_v1.0.csv'),
  categoriesPath: resolvePath(process.env.CATEGORIES_PATH || '../dataset/categories.json')
};

// Simple validations
if (!serverConfig.masterDataPath) {
  throw new Error('Config Error: MASTER_DATA_PATH env variable is required');
}
if (!serverConfig.categoriesPath) {
  throw new Error('Config Error: CATEGORIES_PATH env variable is required');
}

export default serverConfig;
