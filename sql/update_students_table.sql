-- Script cập nhật bảng students để student_code tự động tạo và làm QR code
-- Chạy trong Supabase SQL Editor

-- Bước 1: Xóa các trigger cũ liên quan đến qr_code trước
DROP TRIGGER IF EXISTS generate_qr_code_trigger ON students;

-- Bước 2: Xóa cột qr_code riêng biệt (nếu có)
ALTER TABLE students DROP COLUMN IF EXISTS qr_code CASCADE;

-- Bước 3: Đảm bảo student_code có unique constraint và tự động tạo
ALTER TABLE students ALTER COLUMN student_code SET DEFAULT ('HS' || EXTRACT(YEAR FROM CURRENT_DATE) || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'));

-- Bước 4: Tạo trigger để tự động tạo student_code nếu chưa có
CREATE OR REPLACE FUNCTION generate_student_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu student_code chưa có hoặc rỗng, tạo mới
    IF NEW.student_code IS NULL OR NEW.student_code = '' THEN
        -- Tạo student_code dạng: HS + năm + 6 số random (đủ unique để làm QR)
        NEW.student_code := 'HS' || EXTRACT(YEAR FROM CURRENT_DATE) || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Đảm bảo student_code là duy nhất
        WHILE EXISTS (SELECT 1 FROM students WHERE student_code = NEW.student_code AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
            NEW.student_code := 'HS' || EXTRACT(YEAR FROM CURRENT_DATE) || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Bước 5: Tạo trigger cho INSERT và UPDATE
DROP TRIGGER IF EXISTS generate_student_code_trigger ON students;
CREATE TRIGGER generate_student_code_trigger 
    BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW 
    EXECUTE FUNCTION generate_student_code();

-- Bước 6: Cập nhật các học sinh hiện tại chưa có student_code
UPDATE students 
SET student_code = 'HS' || EXTRACT(YEAR FROM CURRENT_DATE) || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
WHERE student_code IS NULL OR student_code = '';

-- Bước 7: Đảm bảo tất cả student_code đều unique
DO $$
DECLARE
    duplicate_record RECORD;
    new_code TEXT;
BEGIN
    -- Tìm và sửa các student_code trùng lặp
    FOR duplicate_record IN 
        SELECT student_code, COUNT(*) as count_dup
        FROM students 
        WHERE student_code IS NOT NULL 
        GROUP BY student_code 
        HAVING COUNT(*) > 1
    LOOP
        -- Cập nhật tất cả trừ record đầu tiên
        UPDATE students 
        SET student_code = 'HS' || EXTRACT(YEAR FROM CURRENT_DATE) || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
        WHERE student_code = duplicate_record.student_code 
        AND id NOT IN (
            SELECT id FROM students 
            WHERE student_code = duplicate_record.student_code 
            ORDER BY created_at ASC 
            LIMIT 1
        );
    END LOOP;
END $$;

-- Bước 8: Tạo index cho student_code để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_students_student_code_unique ON students(student_code);

-- Bước 9: Cập nhật comment
COMMENT ON COLUMN students.student_code IS 'Mã học sinh tự động tạo, đồng thời dùng làm mã QR để điểm danh (format: HSYYYYNNNNNN)';

-- Bước 10: Tạo view để dễ dàng lấy thông tin QR
CREATE OR REPLACE VIEW students_qr_info AS
SELECT 
    id,
    student_code,
    full_name,
    phone,
    email,
    student_code as qr_code, -- student_code chính là QR code
    CASE 
        WHEN student_code IS NOT NULL AND student_code != '' THEN true
        ELSE false
    END as has_qr_code,
    created_at,
    updated_at
FROM students
WHERE is_active = true;

-- Bước 10: Test để đảm bảo mọi thứ hoạt động
-- Thêm một học sinh mới để test auto-generation
-- INSERT INTO students (full_name, phone, email) 
-- VALUES ('Test Student Auto QR', '0123456789', 'test.auto@example.com');

-- Kiểm tra kết quả
SELECT student_code, full_name, created_at 
FROM students 
ORDER BY created_at DESC 
LIMIT 5;

-- Kiểm tra view
SELECT * FROM students_qr_info LIMIT 5;

COMMENT ON TABLE students IS 'Bảng quản lý học sinh - student_code tự động tạo và dùng làm QR code';
COMMENT ON VIEW students_qr_info IS 'View hiển thị thông tin QR code của học sinh (dựa trên student_code)';
