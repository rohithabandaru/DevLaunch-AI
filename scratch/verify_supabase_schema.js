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

console.log('Connecting to Supabase URL:', url);
const supabase = createClient(url, key);

const tables = [
  'profiles',
  'jobs',
  'interviews',
  'documents',
  'portfolios',
  'portfolio_analytics',
  'portfolio_events'
];

async function verifyTables() {
  const results = {};

  for (const table of tables) {
    console.log(`Checking table: ${table}...`);
    try {
      const { data, error, status } = await supabase.from(table).select('*').limit(1);
      if (error) {
        results[table] = {
          exists: error.code !== '42P01', // 42P01 is undefined_table in Postgres
          error: error.message,
          code: error.code,
          status,
        };
      } else {
        results[table] = {
          exists: true,
          status,
          sampleDataCount: data ? data.length : 0,
          sampleKeys: data && data.length > 0 ? Object.keys(data[0]) : 'empty table'
        };
      }
    } catch (e) {
      results[table] = {
        exists: false,
        error: e.message
      };
    }
  }

  console.log('\n--- VERIFICATION RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
}

verifyTables();
