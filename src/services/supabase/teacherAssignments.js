import { supabase } from './client';

// Lấy danh sách phân công môn-lớp của giáo viên
export const getTeacherSubjectGrades = async (teacherUserId) => {
  try {
    const { data, error } = await supabase
      .from('teacher_subjects_grades')
      .select(`
        *,
        subjects_grades (
          id,
          subject_id,
          grade_id,
          name,
          description,
          subject:subject_id (
            id,
            name,
            description
          )
        )
      `)
      .eq('teacher_user_id', teacherUserId);

    if (error) {
      console.error('Error fetching teacher subject grades:', error);
      return { data: null, error };
    }

    // Transform data
    const transformed = data?.map(item => ({
      id: item.id,
      teacher_user_id: item.teacher_user_id,
      subjects_grades_id: item.subjects_grades_id,
      subject_id: item.subjects_grades?.subject_id,
      grade_id: item.subjects_grades?.grade_id,
      subject_name: item.subjects_grades?.subject?.name,
      combination_name: item.subjects_grades?.name,
      description: item.subjects_grades?.description,
      display_name: item.subjects_grades?.name || 
                   `${item.subjects_grades?.subject?.name || 'Môn học'} - Lớp ${item.subjects_grades?.grade_id || 'N/A'}`
    }));

    return { data: transformed, error: null };
  } catch (error) {
    console.error('Error in getTeacherSubjectGrades:', error);
    return { data: null, error };
  }
};

// Thêm phân công môn-lớp cho giáo viên
export const addTeacherSubjectGrade = async (teacherUserId, subjectGradeId) => {
  try {
    const { data, error } = await supabase
      .from('teacher_subjects_grades')
      .insert({
        teacher_user_id: teacherUserId,
        subjects_grades_id: subjectGradeId
      })
      .select();

    if (error) {
      console.error('Error adding teacher subject grade:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in addTeacherSubjectGrade:', error);
    return { data: null, error };
  }
};

// Xóa phân công môn-lớp của giáo viên
export const removeTeacherSubjectGrade = async (teacherUserId, subjectGradeId) => {
  try {
    const { data, error } = await supabase
      .from('teacher_subjects_grades')
      .delete()
      .eq('teacher_user_id', teacherUserId)
      .eq('subjects_grades_id', subjectGradeId);

    if (error) {
      console.error('Error removing teacher subject grade:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in removeTeacherSubjectGrade:', error);
    return { data: null, error };
  }
};

// Cập nhật tất cả phân công của giáo viên
export const updateTeacherSubjectGrades = async (teacherUserId, subjectGradeAssignments) => {
  try {
    // Xóa tất cả phân công cũ
    await supabase
      .from('teacher_subjects_grades')
      .delete()
      .eq('teacher_user_id', teacherUserId);

    // Nếu có phân công mới, thêm vào
    if (subjectGradeAssignments && subjectGradeAssignments.length > 0) {
      const assignments = subjectGradeAssignments.map(assignment => ({
        teacher_user_id: teacherUserId,
        subjects_grades_id: assignment.subjects_grades_id || assignment.id
      }));

      const { data, error } = await supabase
        .from('teacher_subjects_grades')
        .insert(assignments)
        .select();

      if (error) {
        console.error('Error updating teacher subject grades:', error);
        return { data: null, error };
      }

      return { data, error: null };
    }

    return { data: [], error: null };
  } catch (error) {
    console.error('Error in updateTeacherSubjectGrades:', error);
    return { data: null, error };
  }
};

// Lưu teacher specializations (alias cho updateTeacherSubjectGrades)
export const saveTeacherAssignments = async (teacherUserId, specializationIds) => {
  try {
    // Xóa assignments cũ
    const { error: deleteError } = await supabase
      .from('teacher_subjects_grades')
      .delete()
      .eq('teacher_user_id', teacherUserId);

    if (deleteError) {
      console.error('Error deleting old assignments:', deleteError);
      return { data: null, error: deleteError };
    }

    // Thêm assignments mới
    if (specializationIds && specializationIds.length > 0) {
      const assignments = specializationIds.map(subjectGradeId => ({
        teacher_user_id: teacherUserId,
        subjects_grades_id: subjectGradeId
      }));

      const { data, error } = await supabase
        .from('teacher_subjects_grades')
        .insert(assignments);

      if (error) {
        console.error('Error inserting new assignments:', error);
        return { data: null, error };
      }

      return { data, error: null };
    }

    return { data: [], error: null };
  } catch (error) {
    console.error('Error in saveTeacherAssignments:', error);
    return { data: null, error };
  }
};

// Lấy danh sách subject-grade combinations có sẵn
export const getSubjectGradeCombinations = async () => {
  try {
    const { data, error } = await supabase
      .from('subjects_grades')
      .select('*')
      .order('subject_id', { ascending: true })
      .order('grade_id', { ascending: true });


    if (error) {
      console.error('Error fetching subject grade combinations:', error);
      return { data: [], error };
    }

    if (!data || data.length === 0) {
      console.warn('No subjects_grades data found');
      return { data: [], error: null };
    }

    // Transform data - keep it simple
    const transformed = data.map(item => ({
      id: item.id,
      subject_id: item.subject_id,
      grade_id: item.grade_id,
      name: item.name || `Môn ${item.subject_id} - Lớp ${item.grade_id}`,
      description: item.description || '',
      display_name: item.name || `Môn ${item.subject_id} - Lớp ${item.grade_id}`,
    }));

    return { data: transformed, error: null };
  } catch (error) {
    console.error('Error in getSubjectGradeCombinations:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
};

// Tạo subject-grade combination mới nếu chưa tồn tại
export const createSubjectGradeCombination = async (subjectId, gradeId, name, description) => {
  try {
    // Kiểm tra xem đã tồn tại chưa
    const { data: existing, error: checkError } = await supabase
      .from('subjects_grades')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('grade_id', gradeId)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing subject grade combination:', checkError);
      return { data: null, error: checkError };
    }

    if (existing && existing.length > 0) {
      return { data: existing[0], error: null };
    }

    // Tạo mới nếu chưa tồn tại
    const { data, error } = await supabase
      .from('subjects_grades')
      .insert({
        subject_id: subjectId,
        grade_id: gradeId,
        name: name,
        description: description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subject grade combination:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createSubjectGradeCombination:', error);
    return { data: null, error };
  }
};

// Lấy danh sách giáo viên phù hợp với một subjects_grades_id
export const getTeachersForSubjectGrade = async (subjectGradeId) => {
  try {
    const { data, error } = await supabase
      .from('teacher_subjects_grades')
      .select(`
        teacher:teachers(*)
      `)
      .eq('subject_grade_id', subjectGradeId);

    if (error) {
      console.error('Error fetching teachers for subjectGrade:', error);
      return { data: [], error };
    }

    // flatten to teacher objects
    const teachers = (data || []).map(r => r.teacher).filter(Boolean);
    return { data: teachers, error: null };
  } catch (error) {
    console.error('Error in getTeachersForSubjectGrade:', error);
    return { data: [], error };
  }
};
