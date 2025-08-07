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
