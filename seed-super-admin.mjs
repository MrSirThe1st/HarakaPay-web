import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase backend environment variables. Check your .env.local file.');
}

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedAdmin(email, password) {
  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers({ email });
  if (existing?.users?.length) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'super_admin' },
  });

  if (error) {
    console.error(`Error creating admin ${email}:`, error.message);
    return;
  }

  console.log(`Super-admin seeded: ${email}`);
  // Optional: also insert into 'profiles' table
  await supabase.from('profiles').insert({
    id: data.user.id,
    role: 'super_admin',
  });
}

(async () => {
  await seedAdmin(process.env.ADMIN_EMAIL_1, process.env.ADMIN_PASSWORD_1);
  await seedAdmin(process.env.ADMIN_EMAIL_2, process.env.ADMIN_PASSWORD_2);
})();
