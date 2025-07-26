// Test script to check user_profiles table structure
import { supabaseAdmin } from './src/services/supabase/adminClient.js';

async function testUserProfilesTable() {
  try {
    // Test 1: Check if we can read from user_profiles
    console.log('🔍 Testing read access...');
    const { data: readTest, error: readError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('❌ Read error:', readError);
    } else {
      console.log('✅ Read success:', readTest);
    }
    
    // Test 2: Try a simple insert
    console.log('📝 Testing insert access...');
    const testData = {
      user_id: 'test-' + Date.now(),
      full_name: 'Test User',
      email: 'test@example.com',
      role: 'student',
      first_login: true
    };
    
    const { data: insertTest, error: insertError } = await supabaseAdmin
      .from('user_profiles')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
    } else {
      console.log('✅ Insert success:', insertTest);
      
      // Clean up test data
      await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('user_id', testData.user_id);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testUserProfilesTable();
