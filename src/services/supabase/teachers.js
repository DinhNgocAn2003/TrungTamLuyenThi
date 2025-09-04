import { supabaseAdmin } from './adminClient';

// Simple debug toggle (enable temporarily)
const DEBUG_TEACHERS = true; // set false in production
const logDebug = (...args) => { if (DEBUG_TEACHERS) console.log('[teachers]', ...args); };

// NOTE: teachers table hiện không có cột id, chỉ có user_id => alias trả về id = user_id để không phải sửa nhiều nơi.
export const getTeacherByUserId = async (userId) => {
  if (!userId) return { data: null, error: null };
  try {
    logDebug('getTeacherByUserId start', { userId });
    const { data, error } = await supabaseAdmin
      .from('teachers')
      .select('user_id, full_name, email, phone')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      logDebug('getTeacherByUserId error', error);
      return { data: null, error };
    }
    const normalized = data ? { ...data, id: data.user_id } : null; // alias id
    logDebug('getTeacherByUserId result', normalized);
    return { data: normalized, error: null };
  } catch (error) {
    logDebug('getTeacherByUserId exception', error);
    return { data: null, error };
  }
};

// Get classes (and optionally students) assigned to a given teacher (teacherId = user_id)
export const getClassesForTeacher = async (teacherId, { includeStudents = true, includeTeachers = true } = {}) => {
  if (!teacherId) return { data: [], error: null };
  try {
    logDebug('getClassesForTeacher start', { teacherId, includeStudents, includeTeachers });

    // 1. Lấy danh sách class_id từ bảng mapping class_teachers (teacher_id chứa user_id của giáo viên)
    let { data: mappings, error: mapErr } = await supabaseAdmin
      .from('class_teachers')
      .select('class_id, teacher_id')
      .eq('teacher_id', teacherId);
    if (mapErr) throw mapErr;

    if (!mappings?.length) {
      // Fallback 1: try join on teachers.user_id (in case teacher_id actually points to another surrogate)
      try {
        const { data: joinMap, error: joinErr } = await supabaseAdmin
          .from('class_teachers')
          .select('class_id, teacher_id, teachers!inner(user_id)')
          .eq('teachers.user_id', teacherId);
        if (!joinErr && joinMap?.length) {
          logDebug('fallback join via teachers.user_id success', joinMap.length);
          mappings = joinMap.map(r => ({ class_id: r.class_id, teacher_id: r.teacher_id }));
        } else if (joinErr) {
          logDebug('fallback join error', joinErr);
        } else {
          logDebug('fallback join returned empty');
        }
      } catch (e) {
        logDebug('fallback join exception', e);
      }
    }
    const classIds = (mappings || []).map(m => m.class_id).filter(Boolean);
    logDebug('class mappings resolved', mappings?.length, 'classIds', classIds);
    if (!classIds.length) return { data: [], error: null };

    // 2. Lấy thông tin lớp học
  const { data: classes, error: classErr } = await supabaseAdmin
      .from('classes')
      .select(`
    id,name,description,is_active,subjects_grades_id,
        subjects_grades:subjects_grades(
          id,name,grade_id,subject_id,
          subject:subject_id(id,name)
        )
      `)
      .in('id', classIds)
      .order('id', { ascending: true });
    if (classErr) throw classErr;
    logDebug('base classes fetched', classes?.length);

    // 3. Lấy giáo viên cho mỗi lớp (không join trực tiếp vì không có teachers.id)
    let teachersMap = {};
    if (includeTeachers) {
      const classTeacherRows = mappings || [];
      const teacherIds = [...new Set(classTeacherRows.map(r => r.teacher_id).filter(Boolean))];
      logDebug('teacherIds collected', teacherIds);
      if (teacherIds.length) {
        const { data: teacherRows, error: tErr } = await supabaseAdmin
          .from('teachers')
          .select('user_id, full_name, email, phone')
          .in('user_id', teacherIds);
        if (tErr) throw tErr;
        const teacherById = (teacherRows || []).reduce((m, t) => { m[t.user_id] = t; return m; }, {});
        teachersMap = classTeacherRows.reduce((acc, row) => {
          if (!acc[row.class_id]) acc[row.class_id] = [];
          const t = teacherById[row.teacher_id];
          if (t) {
            acc[row.class_id].push({
              id: t.user_id, // alias
              teacher_id: t.user_id,
              full_name: t.full_name || 'Chưa cập nhật',
              name: t.full_name || 'Chưa cập nhật',
              email: t.email || null,
              phone: t.phone || null
            });
          }
          return acc;
        }, {});
      }
    }

    // 4. Lấy học sinh (enrollments)
    let studentsMap = {};
    if (includeStudents) {
      const { data: enrollments, error: enrErr } = await supabaseAdmin
        .from('class_enrollments')
        .select('id, class_id, student_id, students(user_id, full_name)')
        .in('class_id', classIds);
      if (enrErr) throw enrErr;
      logDebug('enrollments fetched', enrollments?.length);
      studentsMap = (enrollments || []).reduce((acc, row) => {
        if (!acc[row.class_id]) acc[row.class_id] = [];
        if (row.students) {
          // students table trả về user_id (không có cột id trong select ở trên)
          const sid = row.students.user_id; // tránh truy cập field không tồn tại gây lỗi 42703
          acc[row.class_id].push({
            id: sid,
            student_id: sid,
            name: row.students.full_name || 'Chưa có tên',
            full_name: row.students.full_name || 'Chưa có tên'
          });
        }
        return acc;
      }, {});
    }

    // 5. Lấy lịch học (class_schedules)
    let scheduleMap = {};
    try {
      const { data: schedules, error: schErr } = await supabaseAdmin
        .from('class_schedules')
        .select('id,class_id,day_of_week,start_time,end_time,location')
        .in('class_id', classIds);
      if (schErr) throw schErr;
      scheduleMap = (schedules || []).reduce((acc, s) => {
        if (!acc[s.class_id]) acc[s.class_id] = [];
        acc[s.class_id].push(s);
        return acc;
      }, {});
    } catch (schErr) {
      console.warn('Fetch schedules failed', schErr?.message || schErr);
    }

    // 6. Kết hợp dữ liệu
  const enriched = (classes || []).map(c => ({
      ...c,
      subject: c.subjects_grades?.subject ? { name: c.subjects_grades.subject.name } : null,
      students_list: studentsMap[c.id] || [],
      teachers_list: teachersMap[c.id] || [],
      schedule_list: scheduleMap[c.id] || []
    }));
    logDebug('enriched classes length', enriched.length);
    return { data: enriched, error: null };
  } catch (error) {
    console.error('Error getClassesForTeacher:', error);
    return { data: [], error };
  }
};

// Get all teachers
export const getTeachers = async () => {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .select('*')
    .order('full_name');
  
  return { data, error };
};

// Get teacher by ID
export const getTeacherById = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  const normalized = data ? { ...data, id: data.user_id } : null;
  return { data: normalized, error };
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
export const updateTeacher = async (userId, teacherData) => {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .update(teacherData)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  const normalized = data ? { ...data, id: data.user_id } : null;
  return { data: normalized, error };
};

// Delete teacher
export const deleteTeacher = async (userId) => {
  const { error } = await supabaseAdmin
    .from('teachers')
    .delete()
    .eq('user_id', userId);
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

// Lấy danh sách môn học-lớp kết hợp
export const getSubjectGrades = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subjects_grades')
      .select(`
        id,
        name,
        subjects(id, name),
        grades(id, name)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching subject grades:', error);
      return { data: [], error };
    }

    // Chuyển đổi dữ liệu để dễ sử dụng
    const formattedData = data.map(item => ({
      id: item.id,
      subject_id: item.subjects?.id,
      subject_name: item.subjects?.name || '',
      grade_id: item.grades?.id,
      grade_name: item.grades?.name || ''
    }));

    return { data: formattedData, error: null };
  } catch (error) {
    console.error('Error in getSubjectGrades:', error);
    return { data: [], error: error.message };
  }
};

// Lấy môn học giảng dạy của giáo viên
export const getTeacherSubjects = async (teacherId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('teacher_subjects_grades')
      .select(`
        id,
        subjects_grades:subjects_grades(
          id,
          subject:subjects(id, name),
          grade:grades(id, name)
        )
      `)
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Error fetching teacher subjects:', error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getTeacherSubjects:', error);
    return { data: [], error: error.message };
  }
};

// Cập nhật môn học giảng dạy của giáo viên
export const updateTeacherSubjects = async (teacherId, subjectGradeIds) => {
  try {
    // Xóa các môn học cũ
    await supabaseAdmin
      .from('teacher_subjects_grades')
      .delete()
      .eq('teacher_id', teacherId);

    // Thêm các môn học mới
    if (subjectGradeIds && subjectGradeIds.length > 0) {
      const teacherSubjects = subjectGradeIds.map(id => ({
        teacher_id: teacherId,
        subject_grade_id: id  // Sửa lại tên cột cho đúng
      }));

      const { error: insertError } = await supabaseAdmin
        .from('teacher_subjects_grades')
        .insert(teacherSubjects);

      if (insertError) {
        console.error('Error inserting teacher subjects:', insertError);
        return { error: insertError };
      }
    }

    return { error: null };
  } catch (error) {
    console.error('Error in updateTeacherSubjects:', error);
    return { error: error.message };
  }
};
