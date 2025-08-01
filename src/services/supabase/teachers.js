import { supabaseAdmin } from './adminClient';

// Get all teachers
export const getTeachers = async () => {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .select('*')
    .order('full_name');
  
  return { data, error };
};

// Get teacher by ID
export const getTeacherById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Create new teacher
export const createTeacher = async (teacherData) => {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .insert(teacherData)
    .select()
    .single();
  
  return { data, error };
};

// Update teacher
export const updateTeacher = async (id, teacherData) => {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .update(teacherData)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Delete teacher
export const deleteTeacher = async (id) => {
  const { error } = await supabaseAdmin
    .from('teachers')
    .delete()
    .eq('id', id);
  
  return { error };
};

// Get classes taught by teacher
export const getTeacherClasses = async (teacherId) => {
  const { data, error } = await supabaseAdmin
    .from('class_teachers')
    .select(`
      *,
      classes (
        id,
        name,
        subject_id,
        max_students,
        status,
        subjects (name)
      )
    `)
    .eq('teacher_id', teacherId);
  
  return { data, error };
};
