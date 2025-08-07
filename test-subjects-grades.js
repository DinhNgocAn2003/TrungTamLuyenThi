// Test file để kiểm tra subjects_grades table
import { getSubjectGradeCombinations } from './src/services/supabase/teacherAssignments.js';

console.log('Testing subjects_grades table...');

getSubjectGradeCombinations()
  .then(result => {
    console.log('Result:', result);
    if (result.data) {
      console.log('Found subjects_grades:');
      result.data.forEach(sg => {
        console.log(`- ID: ${sg.id}, Subject: ${sg.subject_name}, Grade: ${sg.grade_name || sg.grade_level}, Display: ${sg.display_name}`);
      });
    } else {
      console.log('No data found or error:', result.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
