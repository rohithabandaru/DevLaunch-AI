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

const tables = [
  'profiles',
  'jobs',
  'interviews',
  'documents',
  'portfolios',
  'portfolio_analytics',
  'portfolio_events'
];

async function testAuthDbAccess() {
  const testEmail = `test_db_user_${Date.now()}@devlaunch.test`;
  const testPass = 'TestPass123!#';

  console.log(`1. Signing up user ${testEmail}...`);
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPass,
    options: { data: { full_name: 'DB Test User' } }
  });

  if (authErr) {
    console.error('Auth signup error:', authErr);
    return;
  }

  const user = authData.user;
  console.log('User signed up. ID:', user.id);

  console.log('\n2. Checking table access as authenticated user...');
  for (const table of tables) {
    const { data, error, status } = await supabase.from(table).select('*').limit(5);
    console.log(`Table '${table}': status=${status}, dataLength=${data ? data.length : null}, error=${error ? JSON.stringify(error) : 'null'}`);
  }
}

testAuthDbAccess();
