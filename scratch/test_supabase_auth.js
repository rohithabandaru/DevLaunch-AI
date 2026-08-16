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

async function testAuth() {
  const testEmail = `test_user_${Date.now()}@devlaunch.test`;
  const testPass = 'TestPass123!#';

  console.log(`Attempting signup for ${testEmail}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPass,
    options: {
      data: { full_name: 'Test User' }
    }
  });

  if (signUpError) {
    console.error('SignUp Error:', signUpError);
  } else {
    console.log('SignUp Success! User ID:', signUpData.user ? signUpData.user.id : 'No user', 'Session:', !!signUpData.session);
  }

  console.log('Attempting signInWithPassword...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass,
  });

  if (signInError) {
    console.error('SignIn Error:', signInError);
  } else {
    console.log('SignIn Success! User ID:', signInData.user.id, 'Token:', !!signInData.session.access_token);
  }
}

testAuth();
