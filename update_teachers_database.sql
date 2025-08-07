-- Cập nhật bảng teachers để thêm các trường mới
ALTER TABLE teachers 
ADD COLUMN year_graduation INTEGER,
ADD COLUMN university TEXT,
ADD COLUMN degree TEXT CHECK (degree IN ('Cử nhân', 'Thạc sĩ', 'Tiến sĩ')),
ADD COLUMN notes TEXT;

-- Tạo bảng grades (lớp/khối) nếu chưa có
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- Ví dụ: "Lớp 8", "Lớp 9", "Lớp 10", ...
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng subjects_grades (môn học - lớp/khối)
CREATE TABLE IF NOT EXISTS subjects_grades (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  grade_id INTEGER REFERENCES grades(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Ví dụ: "Toán 8", "Vật lý 9", ...
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subject_id, grade_id)
);

-- Tạo bảng teacher_subjects_grades (quan hệ nhiều-nhiều giữa giáo viên và môn học-lớp)
CREATE TABLE IF NOT EXISTS teacher_subjects_grades (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  subject_grade_id INTEGER REFERENCES subjects_grades(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teacher_id, subject_grade_id)
);

-- Thêm dữ liệu mẫu cho grades
INSERT INTO grades (name, description) VALUES
('Lớp 6', 'Lớp 6 THCS'),
('Lớp 7', 'Lớp 7 THCS'),
('Lớp 8', 'Lớp 8 THCS'),
('Lớp 9', 'Lớp 9 THCS'),
('Lớp 10', 'Lớp 10 THPT'),
('Lớp 11', 'Lớp 11 THPT'),
('Lớp 12', 'Lớp 12 THPT')
ON CONFLICT (name) DO NOTHING;

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teachers_updated_at 
    BEFORE UPDATE ON teachers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at 
    BEFORE UPDATE ON grades 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tạo một số subjects_grades mẫu (kết hợp môn học với các lớp)
-- Giả sử đã có subjects: Toán học, Vật lý, Hóa học, Tiếng Anh, Ngữ văn, Sinh học
INSERT INTO subjects_grades (subject_id, grade_id, name) 
SELECT s.id, g.id, CONCAT(s.name, ' ', g.name)
FROM subjects s
CROSS JOIN grades g
WHERE s.name IN ('Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Ngữ văn', 'Sinh học')
ON CONFLICT (subject_id, grade_id) DO NOTHING;
