import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findPath = (targetFile, defaultRelativePath) => {
  const envPath = targetFile === 'csv' ? process.env.MASTER_DATA_PATH : process.env.CATEGORIES_PATH;
  if (envPath && path.isAbsolute(envPath) && fs.existsSync(envPath)) {
    return envPath;
  }

  const filename = targetFile === 'csv' ? 'ap_master_dataset_v1.0.csv' : 'categories.json';

  const candidates = [
    path.resolve(process.cwd(), 'dataset', filename),
    path.resolve(__dirname, '../../dataset', filename),
    path.resolve(__dirname, '../dataset', filename),
    path.resolve(__dirname, defaultRelativePath),
    path.resolve(process.cwd(), filename)
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.resolve(process.cwd(), 'dataset', filename);
};

const serverConfig = {
  port: parseInt(process.env.PORT, 10) || 5001,
  env: process.env.NODE_ENV || 'development',
  masterDataPath: findPath('csv', '../dataset/ap_master_dataset_v1.0.csv'),
  categoriesPath: findPath('json', '../dataset/categories.json')
};

if (!serverConfig.masterDataPath) {
  throw new Error('Config Error: MASTER_DATA_PATH env variable is required');
}
if (!serverConfig.categoriesPath) {
  throw new Error('Config Error: CATEGORIES_PATH env variable is required');
}

export default serverConfig;
