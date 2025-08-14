import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  throw new Error('Missing Supabase backend environment variables. Check your .env.local file.');
}

console.log('✅ Environment variables loaded successfully');
console.log('🔗 Supabase URL:', supabaseUrl);

// Create supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedAdmin(email, password) {
  if (!email || !password) {
    console.log('⚠️  Skipping admin - missing email or password');
    return;
  }

  console.log(`👤 Processing admin: ${email}`);

  try {
    // Check if user already exists
    const { data: existing, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }

    const existingUser = existing?.users?.find(user => user.email === email);
    if (existingUser) {
      console.log(`✅ Admin already exists: ${email}`);
      
      // Check if profile exists and update if needed
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', existingUser.id)
        .single();
      
      if (!profile) {
        console.log(`🔄 Creating missing profile for existing user: ${email}`);
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: existingUser.id,
          role: 'admin',
          first_name: 'Super',
          last_name: 'Admin',
        });
        
        if (profileError) {
          console.warn(`⚠️  Could not create profile: ${profileError.message}`);
        } else {
          console.log(`✅ Profile created for existing user: ${email}`);
        }
      } else if (profile.role !== 'admin') {
        console.log(`🔄 Updating role to admin for: ${email}`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('user_id', existingUser.id);
        
        if (updateError) {
          console.warn(`⚠️  Could not update role: ${updateError.message}`);
        } else {
          console.log(`✅ Role updated to admin for: ${email}`);
        }
      }
      return;
    }

    // Create new admin user
    console.log(`🔄 Creating admin user: ${email}`);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        first_name: 'Super',
        last_name: 'Admin'
      },
    });

    if (error) {
      console.error(`❌ Error creating admin ${email}:`, error.message);
      console.error('Full error details:', error);
      return;
    }

    console.log(`✅ Super-admin created: ${email}`);
    
    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if profile was created by trigger
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (!existingProfile) {
      // Create profile manually if trigger didn't work
      console.log(`🔄 Creating profile manually for: ${email}`);
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        role: 'admin',
        first_name: 'Super',
        last_name: 'Admin',
      });

      if (profileError) {
        console.warn(`⚠️  Warning: Could not create profile for ${email}:`, profileError.message);
        console.warn('Profile error details:', profileError);
      } else {
        console.log(`✅ Profile created manually for: ${email}`);
      }
    } else {
      // Update role if profile exists but has wrong role
      if (existingProfile.role !== 'admin') {
        console.log(`🔄 Updating profile role for: ${email}`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('user_id', data.user.id);
        
        if (updateError) {
          console.warn(`⚠️  Could not update profile role: ${updateError.message}`);
        } else {
          console.log(`✅ Profile role updated for: ${email}`);
        }
      } else {
        console.log(`✅ Profile already exists with correct role for: ${email}`);
      }
    }

  } catch (error) {
    console.error(`❌ Unexpected error processing ${email}:`, error.message);
    console.error('Full error:', error);
  }
}

(async () => {
  console.log('🚀 Starting admin seeding process...');
  
  try {
    // Test database connection first
    console.log('🔄 Testing database connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection test failed:', error.message);
      console.error('Make sure you have run the database/setup.sql script in your Supabase SQL editor');
      process.exit(1);
    }
    console.log('✅ Database connection successful');
    
    await seedAdmin(process.env.ADMIN_EMAIL_1, process.env.ADMIN_PASSWORD_1);
    await seedAdmin(process.env.ADMIN_EMAIL_2, process.env.ADMIN_PASSWORD_2);
    
    console.log('🎉 Admin seeding process completed successfully!');
  } catch (error) {
    console.error('💥 Fatal error in seeding process:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
})();