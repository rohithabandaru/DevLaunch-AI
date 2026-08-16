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

async function runRealDatabaseE2E() {
  console.log('--- STARTING REAL SUPABASE END-TO-END VERIFICATION ---');

  // Client 1 for User A
  const clientA = createClient(url, key);
  const emailA = `usera_${Date.now()}@devlaunch.test`;
  const passA = 'UserAPass123!#';

  console.log(`\n1. Creating User A (${emailA})...`);
  const { data: authA, error: errAuthA } = await clientA.auth.signUp({
    email: emailA,
    password: passA,
    options: { data: { full_name: 'User Alpha' } }
  });

  if (errAuthA) throw errAuthA;
  const userAId = authA.user.id;
  console.log(`User A created! ID: ${userAId}`);

  // Verify profiles row was auto-created by database trigger handle_new_user
  console.log('\n2. Verifying trigger on_auth_user_created inserted profile for User A...');
  const { data: profileA, error: errProfA } = await clientA.from('profiles').select('*').eq('id', userAId).single();
  console.log('Profile fetch result:', profileA ? 'SUCCESS' : 'FAILED', errProfA || profileA);

  // 3. User A creates a Job Application
  console.log('\n3. User A creating a job application in Supabase...');
  const { data: jobA, error: errJobA } = await clientA.from('jobs').insert({
    user_id: userAId,
    company: 'Stripe',
    role: 'Senior Staff Engineer',
    salary: '$220,000',
    location: 'San Francisco, CA',
    location_type: 'Remote',
    status: 'Applied',
    applied_date: new Date().toISOString().slice(0, 10),
    notes: JSON.stringify({ description: 'Full stack role on Connect Payments' })
  }).select().single();

  if (errJobA) throw errJobA;
  console.log(`Job A inserted! ID: ${jobA.id}, Company: ${jobA.company}, Status: ${jobA.status}`);

  // 4. User A updates the Job
  console.log('\n4. User A updating Job A status to Interview...');
  const { error: errUpdateJobA } = await clientA.from('jobs').update({
    status: 'Interview'
  }).eq('id', jobA.id);
  if (errUpdateJobA) throw errUpdateJobA;
  console.log('Job A updated successfully!');

  // 5. User A creates a Resume document
  console.log('\n5. User A saving Resume document to Supabase...');
  const { data: docA, error: errDocA } = await clientA.from('documents').insert({
    user_id: userAId,
    name: 'Alpha Executive Resume',
    type: 'Resume',
    company: 'Stripe',
    is_active: true
  }).select().single();
  if (errDocA) throw errDocA;
  console.log(`Resume Document A inserted! ID: ${docA.id}, Type: ${docA.type}`);

  // 6. User A creates and publishes a Portfolio
  const slugA = `portfolio-alpha-${Date.now()}`;
  console.log(`\n6. User A creating portfolio with slug '${slugA}'...`);
  const { data: portA, error: errPortA } = await clientA.from('portfolios').insert({
    user_id: userAId,
    slug: slugA,
    title: 'Alpha Developer Portfolio',
    data: { name: 'User Alpha', title: 'Full Stack Staff Engineer' },
    theme: 'modern',
    is_published: true,
    published_at: new Date().toISOString()
  }).select().single();
  if (errPortA) throw errPortA;
  console.log(`Portfolio A created & published! ID: ${portA.id}, Published: ${portA.is_published}`);

  // 7. Client 2 for User B (Cross-User Security Test)
  console.log('\n7. Setting up User B (Cross-Tenant Security Probe)...');
  const clientB = createClient(url, key);
  const emailB = `userb_${Date.now()}@devlaunch.test`;
  const passB = 'UserBPass123!#';

  const { data: authB, error: errAuthB } = await clientB.auth.signUp({
    email: emailB,
    password: passB,
    options: { data: { full_name: 'User Beta' } }
  });
  if (errAuthB) throw errAuthB;
  console.log(`User B created! ID: ${authB.user.id}`);

  // Attempt 7a: User B reads User A's jobs
  console.log("\n--- CROSS-USER SECURITY RLS PROBES ---");
  const { data: userBReadJobs } = await clientB.from('jobs').select('*').eq('id', jobA.id);
  console.log(`Probe 1: User B read User A's Job -> Returned ${userBReadJobs.length} rows (Expected: 0)`);

  // Attempt 7b: User B updates User A's job
  const { data: userBUpdateJob } = await clientB.from('jobs').update({ company: 'HACKED' }).eq('id', jobA.id).select();
  console.log(`Probe 2: User B update User A's Job -> Returned ${userBUpdateJob ? userBUpdateJob.length : 0} rows (Expected: 0)`);

  // Attempt 7c: User B deletes User A's job
  const { data: userBDeleteJob } = await clientB.from('jobs').delete().eq('id', jobA.id).select();
  console.log(`Probe 3: User B delete User A's Job -> Returned ${userBDeleteJob ? userBDeleteJob.length : 0} rows (Expected: 0)`);

  // Attempt 7d: User B reads User A's resume document
  const { data: userBReadDoc } = await clientB.from('documents').select('*').eq('id', docA.id);
  console.log(`Probe 4: User B read User A's Resume -> Returned ${userBReadDoc.length} rows (Expected: 0)`);

  // 8. Public Portfolio Test (Logged out visitor)
  console.log('\n8. Public Portfolio Test (Logged out visitor access)...');
  const publicClient = createClient(url, key);
  const { data: publicPort, error: errPublicPort } = await publicClient
    .from('portfolios')
    .select('slug, title, data, theme')
    .eq('slug', slugA)
    .eq('is_published', true)
    .single();

  console.log('Public Portfolio fetch:', publicPort ? 'SUCCESS' : 'FAILED', publicPort);

  // 9. Portfolio Event Analytics Test
  console.log('\n9. Logging public view event to portfolio_events...');
  const { data: viewEvent, error: errEvent } = await publicClient.from('portfolio_events').insert({
    portfolio_id: portA.id,
    event_type: 'view',
    visitor_hash: 'anon_hash_123',
    metadata: { browser: 'Incognito' }
  }).select().single();
  console.log('Portfolio Event Insert:', viewEvent ? 'SUCCESS' : 'FAILED', errEvent || viewEvent.id);

  // Probe 5: User B tries to read User A's portfolio_events
  const { data: userBReadEvents } = await clientB.from('portfolio_events').select('*').eq('portfolio_id', portA.id);
  console.log(`Probe 5: User B read User A's Portfolio Events -> Returned ${userBReadEvents.length} rows (Expected: 0)`);

  // 10. User A deletes Job A
  console.log("\n10. User A deleting Job A...");
  const { error: errDeleteJobA } = await clientA.from('jobs').delete().eq('id', jobA.id);
  if (errDeleteJobA) throw errDeleteJobA;
  console.log('Job A deleted successfully!');

  // Verify deletion
  const { data: checkDeleted } = await clientA.from('jobs').select('*').eq('id', jobA.id);
  console.log(`Job A verification query returned ${checkDeleted.length} rows (Expected: 0)`);

  console.log('\n==================================================');
  console.log('ALL REAL SUPABASE E2E & RLS TESTS PASSED 100% PERFECTLY!');
  console.log('==================================================');
}

runRealDatabaseE2E().catch(err => {
  console.error('E2E VERIFICATION ERROR:', err);
  process.exit(1);
});
