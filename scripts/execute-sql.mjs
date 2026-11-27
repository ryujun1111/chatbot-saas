import { readFileSync } from 'fs';

const supabaseUrl = 'https://inytvaovnlcuziqchsiy.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueXR2YW92bmxjdXppcWNoc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTc5MTA4NSwiZXhwIjoyMTExMzY3MDg1fQ.M_BBBvsMhEWboFzK75vLTWbVxn5mpQ-bVmcv4RTNtXE';

const migrations = [
  '001_initial_schema.sql',
  '002_security_fixed.sql',
  '003_auth_integration.sql'
];

async function execute(filename) {
  console.log(`\n📄 ${filename}`);
  
  const sql = readFileSync(`supabase/migrations/${filename}`, 'utf8');
  
  // Direct SQL execution via Supabase REST API
  const url = `${supabaseUrl}/rest/v1/rpc/sql`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sql })
  });

  console.log(`Status: ${response.status}`);
  
  if (!response.ok) {
    const text = await response.text();
    console.log('Error:', text.substring(0, 200));
    return false;
  }

  console.log('✅ PASS');
  return true;
}

console.log('🚀 Executing SQL migrations...');
console.log('Target:', supabaseUrl);

for (const file of migrations) {
  const success = await execute(file);
  if (!success) {
    console.log(`\n❌ Failed at ${file}`);
    console.log('\n⚠️ Manual execution required:');
    console.log('https://supabase.com/dashboard/project/inytvaovnlcuziqchsiy/sql/new');
    process.exit(1);
  }
}

console.log('\n✅ All migrations executed');
