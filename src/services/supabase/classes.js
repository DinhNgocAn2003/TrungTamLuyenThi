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
  try {
    const { data: cls, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return { data: null, error };

    if (!cls) return { data: null, error: null };

    // Try to attach subjects_grades if the class references it
    try {
      if (cls.subjects_grades_id) {
        const { data: sg, error: sgErr } = await supabase
          .from('subjects_grades')
          .select('*')
          .eq('id', cls.subjects_grades_id)
          .maybeSingle();

        if (!sgErr) {
          // attach as subjects_grades for backward compatibility
          return { data: { ...cls, subjects_grades: sg }, error: null };
        }
      }

      // Fallback: if class references subject_id (legacy), fetch subject
      if (cls.subject_id) {
        const { data: subject, error: sErr } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', cls.subject_id)
          .maybeSingle();

        if (!sErr) {
          return { data: { ...cls, subject }, error: null };
        }
      }
    } catch (innerErr) {
      // ignore and return class only
      console.warn('Could not fetch related subject(s):', innerErr);
    }

    return { data: cls, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

export const getOpenClasses = async () => {
  try {
    // Fetch active classes and include subjects_grades relation (if FK exists: classes.subjects_grades_id -> subjects_grades.id)
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        subjects_grades:subjects_grades(*)
      `)
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) throw error;

    // Backward compatibility mapping: provide subject object so existing UI using classItem.subject?.name doesn't break
    const mapped = (data || []).map(row => ({
      ...row,
      subject: row.subjects_grades ? { name: row.subjects_grades.display_name || row.subjects_grades.name || '' } : null
    }));

    return { data: mapped, error: null };
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
  try {
    // Query class_teachers and include teacher info
    const { data, error } = await supabaseAdmin
      .from('class_teachers')
      .select(`
        *,
        teacher:teachers(*)
      `)
      .eq('class_id', classId)
      .order('id', { ascending: true });

    if (error) throw error;

    // Normalize to an array of teacher-like objects to keep compatibility with UI
    const normalized = (data || []).map(row => {
      const t = row.teacher || {};
      // Prefer teacher.id for identity, fall back to teacher_id
      const teacherId = t.id || row.teacher_id || null;

      return {
        // provide id so UI using teacher.id continues to work
        id: teacherId,
        // raw class_teachers fields useful for management
        class_teacher_id: row.id,
        class_id: row.class_id,
        teacher_id: row.teacher_id,
        is_main: row.is_main === true,
        notes: row.notes || null,
        // teacher profile fields
        full_name: t.full_name || t.name || null,
        email: t.email || null,
        phone: t.phone || null,
        // include original teacher object for advanced uses
        teacher: t
      };
    });

    return { data: normalized, error: null };
  } catch (error) {
    console.error('Error fetching class teachers:', error);
    return { data: null, error };
  }
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
  try {
    // Query class_schedules table directly instead of relying on a stored RPC
    const { data, error } = await supabaseAdmin
      .from('class_schedules')
      .select('*')
      .eq('class_id', classId)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching class schedules:', error);
    return { data: null, error };
  }
};

// Bulk fetch schedules for many classes (conflict checking)
export const getSchedulesForClasses = async (classIds = []) => {
  if (!Array.isArray(classIds) || classIds.length === 0) {
    return { data: [], error: null };
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('class_schedules')
      .select('*')
      .in('class_id', classIds);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching schedules for classes:', error);
    return { data: null, error };
  }
};

export const setClassTeachers = async (classId, teacherAssignments = []) => {
  try {
    // Map to teacher IDs (PK from teachers table). Prefer item.id / teacher_id. Only fallback to user_id if that is how caller passed.
    const teacherIds = Array.isArray(teacherAssignments)
      ? teacherAssignments.map(item => {
          if (typeof item === 'number') return item;
          return item?.id || item?.teacher_id || item?.teacherId || null; // avoid user_id here to keep join integrity
        }).filter(Boolean)
      : [];
  // Delete existing assignments for this class (replace-all strategy)
    const { error: delErr } = await supabaseAdmin
      .from('class_teachers')
      .delete()
      .eq('class_id', classId);

    if (delErr) throw delErr;

    // Insert new simple rows (class_id, teacher_id) and return inserted rows for debugging
    let inserted = null;
    if (teacherIds.length) {
      const inserts = teacherIds.map(tid => ({ class_id: classId, teacher_id: tid }));
      const { data: insData, error: insErr } = await supabaseAdmin
        .from('class_teachers')
        .insert(inserts)
        .select();
      if (insErr) throw insErr;
      inserted = insData;
    }
    else {
      try { console.warn('[setClassTeachers] No teacher IDs derived; nothing inserted'); } catch(_) {}
    }
    return { error: null, data: inserted };
  } catch (error) {
    console.error('Error in setClassTeachers:', error);
    return { error };
  }
};

export const enrollClass = async (enrollmentData) => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .insert([enrollmentData])
    .select();
  
  return { data, error };
};

// Simple bulk add (no delete) used right after creating a new class
export const addTeachersToClass = async (classId, teacherIds = []) => {
  if (!classId || !Array.isArray(teacherIds) || teacherIds.length === 0) {
    return { data: [], error: null };
  }
  const rows = teacherIds.filter(Boolean).map(id => ({ class_id: classId, teacher_id: id }));
  const { data, error } = await supabaseAdmin
    .from('class_teachers')
    .insert(rows)
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