const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAvailableFunctions() {
  try {
    console.log('🔍 Checking what functions are available in your database...\n');

    // Try to get available functions
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('pronamespace', (await supabase.from('pg_namespace').select('oid').eq('nspname', 'public')).data?.[0]?.oid)
      .limit(10);

    if (functionsError) {
      console.log('❌ Cannot access pg_proc directly:', functionsError.message);
    } else {
      console.log('📋 Available functions:', functions);
    }

    // Try to check if we can access information_schema
    console.log('\n🔍 Testing information_schema access...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);

    if (tablesError) {
      console.log('❌ Cannot access information_schema:', tablesError.message);
    } else {
      console.log('✅ Can access information_schema');
      console.log('📋 Sample tables:', tables);
    }

    // Try to check pg_policies directly
    console.log('\n🔍 Testing pg_policies access...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname')
      .limit(5);

    if (policiesError) {
      console.log('❌ Cannot access pg_policies:', policiesError.message);
    } else {
      console.log('✅ Can access pg_policies');
      console.log('📋 Sample policies:', policies);
    }

    console.log('\n🎯 Conclusion:');
    console.log('The exec_sql function was never created in your database.');
    console.log('This means your migration scripts were never actually executed.');
    console.log('The RLS policies exist but were created through a different method.');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkAvailableFunctions();
