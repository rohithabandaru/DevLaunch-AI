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

async function testEventsPolicy() {
  const client = createClient(url, key);
  const email = `eventtest_${Date.now()}@devlaunch.test`;
  const { data: auth } = await client.auth.signUp({ email, password: 'TestPassword123!' });
  const userId = auth.user.id;

  const slug = `event-test-${Date.now()}`;
  const { data: port } = await client.from('portfolios').insert({
    user_id: userId,
    slug,
    title: 'Event Test Portfolio',
    is_published: true
  }).select().single();

  console.log('Created published portfolio:', port.id);

  // Test insert event as authenticated user
  const { data: eventAuth, error: errAuth } = await client.from('portfolio_events').insert({
    portfolio_id: port.id,
    event_type: 'view'
  }).select().single();
  console.log('Auth user insert event:', eventAuth ? 'SUCCESS' : 'FAILED', errAuth || eventAuth.id);

  // Test owner fetch analytics
  const { data: ownerEvents } = await client.from('portfolio_events').select('*').eq('portfolio_id', port.id);
  console.log('Owner fetch events count:', ownerEvents ? ownerEvents.length : 0);
}

testEventsPolicy();
