import { supabase } from './client';

// ----- CLASSES -----
export const getClasses = async () => {
  const { data, error } = await supabase
    .from('classes')
    .select('*');
  
  return { data, error };
};

export const getClassById = async (id) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*, subjects (*)')
    .eq('id', id)
    .single();
  
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
  const { data, error } = await supabase
    .from('classes')
    .insert(classData)
    .select();
  
  return { data, error };
};

export const updateClass = async (id, classData) => {
  const { data, error } = await supabase
    .from('classes')
    .update(classData)
    .eq('id', id)
    .select();
  
  return { data, error };
};

export const deleteClass = async (id) => {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);
  
  return { error };
};

export const getEnrollments = async (classId) => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select('*, students(*)')
    .eq('class_id', classId);
  
  return { data, error };
};

export const addClassSchedule = async (classId, scheduleData) => {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name', { ascending: true });
  
  return { data, error };
};

export const getTeachers = async () => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('full_name');
  
  return { data, error };
};

export const assignTeacher = async (classId, teacherId, isMain = false) => {
  const { data, error } = await supabase
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
  const { error } = await supabase
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
  const { error } = await supabase
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