import { supabase } from './client';
import { supabaseAdmin } from './adminClient';

// ----- CLASSES -----
export const getClasses = async () => {
  // Use admin client for admin operations to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('classes')
    .select('*');
  
  return { data, error };
};

export const getClassById = async (id) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*, subjects (*)')
    .eq('id', id)
    .maybeSingle(); // Sử dụng maybeSingle() thay vì single()
  
  return { data, error };
};

export const getOpenClasses = async () => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('status', 'active')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching open classes:', error);
    return { data: null, error };
  }
};

export const createClass = async (classData) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('classes')
    .insert(classData)
    .select();
  
  return { data, error };
};

export const updateClass = async (id, classData) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('classes')
    .update(classData)
    .eq('id', id)
    .select();
  
  return { data, error };
};

export const deleteClass = async (id) => {
  // Use admin client to bypass RLS
  const { error } = await supabaseAdmin
    .from('classes')
    .delete()
    .eq('id', id);
  
  return { error };
};

export const getEnrollments = async (classId = null, studentId = null) => {
  let query = supabase
    .from('class_enrollments')
    .select('*, students(*), classes(*)');
  
  if (classId) {
    query = query.eq('class_id', classId);
  }
  
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const addClassSchedule = async (classId, scheduleData) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('class_schedules')
    .insert({
      class_id: classId,
      day_of_week: scheduleData.day_of_week,
      start_time: scheduleData.start_time,
      end_time: scheduleData.end_time,
      location: scheduleData.location
    })
    .select();
  
  return { data, error };
};

export const getSubjects = async () => {
  // Use admin client for admin operations
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .select('*')
    .order('name', { ascending: true });
  
  return { data, error };
};

export const getTeachers = async () => {
  // Use admin client for admin operations
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .select('*')
    .order('full_name');
  
  return { data, error };
};

export const assignTeacher = async (classId, teacherId, isMain = false) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('class_teachers')
    .insert({
      class_id: classId,
      teacher_id: teacherId,
      is_main: isMain
    })
    .select();
  
  return { data, error };
};

export const removeTeacher = async (classId, teacherId) => {
  // Use admin client to bypass RLS
  const { error } = await supabaseAdmin
    .from('class_teachers')
    .delete()
    .match({ class_id: classId, teacher_id: teacherId });
  
  return { error };
};

export const getClassTeachers = async (classId) => {
  const { data, error } = await supabase
    .rpc('get_class_teachers', { p_class_id: classId });
  
  return { data, error };
};

export const removeClassSchedule = async (id) => {
  // Use admin client to bypass RLS
  const { error } = await supabaseAdmin
    .from('class_schedules')
    .delete()
    .eq('id', id);
  
  return { error };
};

export const getClassSchedules = async (classId) => {
  const { data, error } = await supabase
    .rpc('get_class_schedules', { p_class_id: classId });
  
  return { data, error };
};

export const enrollClass = async (enrollmentData) => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .insert([enrollmentData])
    .select();
  
  return { data, error };
};

// export const getStudentByUserId = async (userId) => {
//   const { data, error } = await supabase
//     .from('students')
//     .select('*')
//     .eq('user_id', userId)
//     .single();
  
//   return { data, error };
// };