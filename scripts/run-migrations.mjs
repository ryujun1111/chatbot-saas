import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://inytvaovnlcuziqchsiy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSQL(filename) {
  console.log(`\n📄 Running ${filename}...`);
  
  const sql = readFileSync(`supabase/migrations/${filename}`, 'utf8');
  
  try {
    // Execute SQL directly using REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ HTTP Error ${response.status}:`, error);
      console.log('\n⚠️  SQL needs manual execution in Supabase SQL Editor');
      console.log('URL: https://supabase.com/dashboard/project/inytvaovnlcuziqchsiy/sql/new');
      return false;
    }

    console.log(`✅ ${filename} executed`);
    return true;
  } catch (error) {
    console.error(`❌ Error in ${filename}:`, error.message);
    console.log('\n⚠️  SQL needs manual execution in Supabase SQL Editor');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migrations...\n');
  console.log('Target:', supabaseUrl);

  const migrations = [
    '001_initial_schema.sql',
    '002_security_fixed.sql',
    '003_auth_integration.sql'
  ];

  for (const migration of migrations) {
    const success = await runSQL(migration);
    if (!success) {
      console.error(`\n❌ Migration failed at ${migration}`);
      process.exit(1);
    }
  }

  console.log('\n✅ All migrations completed successfully');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
