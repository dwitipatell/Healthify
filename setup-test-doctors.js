/**
 * Setup Test Doctors
 * Run this script to create test doctor accounts in Supabase
 * 
 * Usage: node setup-test-doctors.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bxwdtygslzrq1jkbdy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4d2R0eWdzbHpycTFqa2JkeSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzEwNjAxNzAwLCJleHAiOjE3MjYxNTM3MDB9.3b8eb591i9651';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const testDoctors = [
  {
    email: 'priya.mehta@apollo.com',
    password: 'Doctor@123',
    profile: {
      full_name: 'Dr. Priya Mehta',
      specialty: 'Cardiology',
      clinic: 'Apollo Clinic',
      phone: '+91-9876543210',
      years_of_experience: 8,
      hospital: 'Apollo Clinic',
      license_number: 'MED-PRIYA-001',
    }
  },
  {
    email: 'rohit.sharma@skincare.com',
    password: 'Doctor@456',
    profile: {
      full_name: 'Dr. Rohit Sharma',
      specialty: 'Dermatology',
      clinic: 'Skin Care Hub',
      phone: '+91-9876543211',
      years_of_experience: 6,
      hospital: 'Skin Care Hub',
      license_number: 'MED-ROHIT-001',
    }
  },
  {
    email: 'anita.kapoor@bonecenter.com',
    password: 'Doctor@789',
    profile: {
      full_name: 'Dr. Anita Kapoor',
      specialty: 'Orthopedics',
      clinic: 'Bone & Joint Centre',
      phone: '+91-9876543212',
      years_of_experience: 10,
      hospital: 'Bone & Joint Centre',
      license_number: 'MED-ANITA-001',
    }
  },
];

async function setupDoctors() {
  console.log('🏥 Setting up test doctor accounts...\n');

  for (const doctor of testDoctors) {
    try {
      console.log(`📝 Registering ${doctor.profile.full_name}...`);

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: doctor.email,
        password: doctor.password,
        options: {
          data: {
            full_name: doctor.profile.full_name,
            role: 'doctor',
          }
        }
      });

      if (authError) {
        console.error(`  ❌ Auth error: ${authError.message}`);
        continue;
      }

      const userId = authData.user?.id;
      if (!userId) {
        console.error(`  ❌ No user ID returned`);
        continue;
      }

      console.log(`  ✓ Auth user created: ${userId}`);

      // 2. Wait a moment
      await new Promise(r => setTimeout(r, 1000));

      // 3. Create doctor profile
      const { data: profileData, error: profileError } = await supabase
        .from('doctors')
        .insert({
          user_id: userId,
          full_name: doctor.profile.full_name,
          email: doctor.email,
          phone: doctor.profile.phone,
          specialty: doctor.profile.specialty,
          hospital: doctor.profile.hospital,
          clinic: doctor.profile.clinic,
          license_number: doctor.profile.license_number,
          years_of_experience: doctor.profile.years_of_experience,
          is_active: true,
          avg_consult_min: 20,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        console.error(`  ❌ Profile error: ${profileError.message}`);
        continue;
      }

      console.log(`  ✓ Doctor profile created`);
      console.log(`  📧 Email: ${doctor.email}`);
      console.log(`  🔑 Password: ${doctor.password}`);
      console.log(`  ✨ Ready to login!\n`);

    } catch (err) {
      console.error(`  ❌ Error: ${err.message}\n`);
    }
  }

  console.log('✅ Setup complete! Use the credentials above to log in as a doctor.\n');
}

setupDoctors().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
