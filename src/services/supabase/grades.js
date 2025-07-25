import { supabase } from './client';

// ----- GRADES & EXAMS -----
export const getGrades = async (classId = null, studentId = null) => {
  let query = supabase
    .from('grades')
    .select('*, students(*), classes(*), exams(*)');
  
  if (classId) {
    query = query.eq('class_id', classId);
  }
  
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const getExamResults = async (classId = null, studentId = null) => {
  let query = supabase
    .from('exam_results')
    .select('*, exams(*), students(*)');
  
  if (classId) {
    query = query.eq('exams.class_id', classId);
  }
  
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const getExams = async (classId = null) => {
  let query = supabase
    .from('exams')
    .select('*, classes(*)')
    .order('exam_date', { ascending: false });
  
  if (classId) {
    query = query.eq('class_id', classId);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const createExam = async (examData) => {
  const { data, error } = await supabase
    .from('exams')
    .insert(examData)
    .select();
  
  return { data, error };
};

export const updateExam = async (id, examData) => {
  const { data, error } = await supabase
    .from('exams')
    .update(examData)
    .eq('id', id)
    .select();
  
  return { data, error };
};

export const deleteExam = async (id) => {
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', id);
  
  return { error };
};

export const saveExamResult = async (resultData) => {
  const { data, error } = await supabase
    .from('exam_results')
    .upsert(resultData)
    .select();
  
  return { data, error };
};