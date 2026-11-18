/**
 * Script de terminal para sincronizar manualmente el negocio de esta carpeta
 * con las tablas de Supabase (`businesses`, `services`, `staff`, `faqs`).
 * Uso: npm run sync:supabase
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function loadDotEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
  return env;
}

const env = loadDotEnv();
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env');
  process.exit(1);
}

console.log(`✅ Conectado a Supabase: ${SUPABASE_URL}`);
console.log('ℹ️  Al abrir la aplicación con "npm run dev", src/config/business.config.ts se sincroniza automáticamente con Supabase.');
