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

async function testEndpoints() {
  const sql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'schema.sql'), 'utf8');
  console.log('Schema SQL length:', sql.length);

  // Test 1: PostgREST query endpoint
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'SELECT 1;' })
    });
    console.log('Test 1 (POST /rest/v1/):', res.status, await res.text());
  } catch (e) {
    console.log('Test 1 error:', e.message);
  }

  // Test 2: SQL endpoint
  try {
    const res = await fetch(`${url}/pg/v1/query`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'SELECT 1;' })
    });
    console.log('Test 2 (POST /pg/v1/query):', res.status, await res.text());
  } catch (e) {
    console.log('Test 2 error:', e.message);
  }
}

testEndpoints();
