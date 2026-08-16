const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const candidates = [
  'projects', 'users', 'profiles', 'jobs', 'interviews', 'documents',
  'portfolios', 'portfolio_analytics', 'portfolio_events', 'items', 'tasks'
];

async function findTables() {
  for (const table of candidates) {
    const { data, error, status } = await supabase.from(table).select('*').limit(1);
    console.log(`Table '${table}': status=${status}, code=${error?.code}, msg=${error?.message}`);
  }
}

findTables();
