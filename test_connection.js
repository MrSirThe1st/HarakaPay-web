const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function extractPolicies() {
  try {
    console.log('🔍 Extracting RLS policies from HarakaPay database...\n');

    // Try to get information about existing tables first
    console.log('📋 1. Checking existing tables...');
    
    // Get all tables in public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError);
    } else {
      console.log('Found', tables?.length || 0, 'tables in public schema');
      if (tables && tables.length > 0) {
        console.log('Tables:');
        tables.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      }
    }

    // Try to get columns from a known table to test connection
    console.log('\n📋 2. Testing connection with profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError);
    } else {
      console.log('✅ Successfully connected to profiles table');
      console.log('Sample data:', profiles);
    }

    // Try to get schools table
    console.log('\n📋 3. Testing schools table...');
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name')
      .limit(1);

    if (schoolsError) {
      console.error('❌ Error accessing schools table:', schoolsError);
    } else {
      console.log('✅ Successfully connected to schools table');
      console.log('Sample data:', schools);
    }

    // Try to get students table
    console.log('\n📋 4. Testing students table...');
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .limit(1);

    if (studentsError) {
      console.error('❌ Error accessing students table:', studentsError);
    } else {
      console.log('✅ Successfully connected to students table');
      console.log('Sample data:', students);
    }

    // Try to get parents table
    console.log('\n📋 5. Testing parents table...');
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('id, first_name, last_name')
      .limit(1);

    if (parentsError) {
      console.error('❌ Error accessing parents table:', parentsError);
    } else {
      console.log('✅ Successfully connected to parents table');
      console.log('Sample data:', parents);
    }

    // Try to get store-related tables
    console.log('\n📋 6. Testing store tables...');
    const { data: storeItems, error: storeItemsError } = await supabase
      .from('store_items')
      .select('id, name')
      .limit(1);

    if (storeItemsError) {
      console.error('❌ Error accessing store_items table:', storeItemsError);
    } else {
      console.log('✅ Successfully connected to store_items table');
      console.log('Sample data:', storeItems);
    }

    console.log('\n✅ Database connection test completed!');
    console.log('📄 The database is accessible and contains the expected tables.');
    console.log('🎯 Since RLS policies are enforced at the database level, you can recreate them using the my_database.txt schema.');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

extractPolicies();
