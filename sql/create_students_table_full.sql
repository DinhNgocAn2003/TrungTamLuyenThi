-- Script tạo bảng students hoàn chỉnh với ID custom format làm QR code
-- Chạy trong Supabase SQL Editor

-- Bước 1: Tạo extension nếu chưa có
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bước 2: Tạo function để generate custom ID format
CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    year_part TEXT;
    random_part TEXT;
    counter INTEGER;
BEGIN
    -- Lấy năm hiện tại
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Tạo ID với format: HS + năm + 6 số random
    LOOP
        random_part := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        new_id := 'HS' || year_part || random_part;
        
        -- Kiểm tra xem ID đã tồn tại chưa
        IF NOT EXISTS (SELECT 1 FROM students WHERE id = new_id) THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Bước 3: Xóa bảng cũ nếu tồn tại (CẨN THẬN - sẽ mất dữ liệu!)
DROP TABLE IF EXISTS students CASCADE;

-- Bước 4: Tạo bảng students mới với cấu trúc hoàn chỉnh
CREATE TABLE students (
    -- Primary key với format custom (HS + năm + 6 số)
    id TEXT PRIMARY KEY DEFAULT generate_student_id(),
    
    -- Foreign key đến auth.users
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Thông tin cơ bản học sinh
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
    
    -- Thông tin phụ huynh
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    parent_zalo VARCHAR(20),
    
    -- Thông tin học tập
    school VARCHAR(255),
    grade VARCHAR(20),
    academic_year VARCHAR(20) DEFAULT (EXTRACT(YEAR FROM CURRENT_DATE) || '-' || (EXTRACT(YEAR FROM CURRENT_DATE) + 1)),
    
    -- Thông tin bổ sung
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'dropped')),
    avatar_url TEXT,
    notes TEXT,
    
    -- Thông tin y tế và khẩn cấp
    medical_conditions TEXT,
    emergency_contact JSONB,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bước 5: Tạo indexes để tối ưu performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_email ON students(email) WHERE email IS NOT NULL;
CREATE INDEX idx_students_phone ON students(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_students_parent_phone ON students(parent_phone) WHERE parent_phone IS NOT NULL;
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_full_name ON students USING gin(to_tsvector('english', full_name));
CREATE INDEX idx_students_created_at ON students(created_at);
CREATE INDEX idx_students_is_active ON students(is_active);

-- Bước 6: Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bước 7: Tạo trigger cho updated_at
CREATE TRIGGER trigger_update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_students_updated_at();

-- Bước 8: Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Bước 9: Tạo policies cho RLS
-- Policy cho admin - có thể làm mọi thứ
CREATE POLICY students_admin_all ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND u.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy cho students - chỉ xem được thông tin của mình
CREATE POLICY students_select_own ON students
    FOR SELECT USING (auth.uid() = user_id);

-- Policy cho students - có thể cập nhật một số thông tin của mình
CREATE POLICY students_update_own ON students
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy cho teachers - có thể xem students trong lớp của họ
CREATE POLICY students_teacher_view ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            JOIN classes c ON e.class_id = c.id
            JOIN teachers t ON c.teacher_id = t.id
            WHERE e.student_id = students.id
            AND t.user_id = auth.uid()
        )
    );

-- Bước 10: Tạo view để dễ dàng lấy thông tin QR và thống kê
CREATE OR REPLACE VIEW students_with_qr AS
SELECT 
    s.*,
    s.id as qr_code, -- ID chính là QR code
    CASE 
        WHEN s.id IS NOT NULL AND s.id != '' THEN true
        ELSE false
    END as has_qr_code
FROM students s
WHERE s.is_active = true;

-- Bước 11: Tạo view thống kê chi tiết
CREATE OR REPLACE VIEW students_stats AS
SELECT 
    s.*,
    s.id as qr_code,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) as active_enrollments,
    COUNT(DISTINCT p.id) as total_payments,
    COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_paid,
    COUNT(DISTINCT a.id) as total_attendance,
    COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present_count,
    CASE 
        WHEN COUNT(DISTINCT a.id) > 0 THEN 
            ROUND(COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / COUNT(DISTINCT a.id), 2)
        ELSE 0 
    END as attendance_rate
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id
LEFT JOIN payments p ON s.id = p.student_id
LEFT JOIN attendance a ON s.id = a.student_id
WHERE s.is_active = true
GROUP BY s.id;

-- Bước 12: Tạo function để search students
CREATE OR REPLACE FUNCTION search_students(search_term TEXT)
RETURNS TABLE (
    id TEXT,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    school VARCHAR(255),
    grade VARCHAR(20),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    qr_code TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.full_name,
        s.email,
        s.phone,
        s.school,
        s.grade,
        s.parent_name,
        s.parent_phone,
        s.id as qr_code
    FROM students s
    WHERE s.is_active = true
    AND (
        s.full_name ILIKE '%' || search_term || '%'
        OR s.email ILIKE '%' || search_term || '%'
        OR s.phone ILIKE '%' || search_term || '%'
        OR s.id ILIKE '%' || search_term || '%'
        OR s.parent_name ILIKE '%' || search_term || '%'
        OR s.parent_phone ILIKE '%' || search_term || '%'
    )
    ORDER BY s.full_name;
END;
$$ LANGUAGE plpgsql;

-- Bước 13: Thêm dữ liệu mẫu
INSERT INTO students (
    full_name, 
    email, 
    phone, 
    address, 
    date_of_birth, 
    gender, 
    parent_name, 
    parent_phone, 
    parent_zalo,
    school, 
    grade, 
    notes
) VALUES 
(
    'Nguyễn Văn An', 
    'nguyenvanan@example.com', 
    '0123456789', 
    '123 Đường ABC, Quận 1, TP.HCM', 
    '2008-05-15', 
    'Nam', 
    'Nguyễn Văn Bình', 
    '0987654321', 
    '0987654321',
    'THPT Lê Quý Đôn', 
    '10A1', 
    'Học sinh giỏi toán'
),
(
    'Trần Thị Bích', 
    'tranthbich@example.com', 
    '0123456790', 
    '456 Đường XYZ, Quận 2, TP.HCM', 
    '2008-08-20', 
    'Nữ', 
    'Trần Văn Chính', 
    '0987654322', 
    '0987654322',
    'THPT Nguyễn Du', 
    '10A2', 
    'Học sinh tích cực'
),
(
    'Lê Minh Đức', 
    'leminhdc@example.com', 
    '0123456791', 
    '789 Đường DEF, Quận 3, TP.HCM', 
    '2008-12-10', 
    'Nam', 
    'Lê Văn Em', 
    '0987654323', 
    '0987654323',
    'THPT Trần Hưng Đạo', 
    '10A3', 
    'Học sinh khá giỏi'
)
ON CONFLICT (email) DO NOTHING;

-- Bước 14: Tạo function helper để validate student data
CREATE OR REPLACE FUNCTION validate_student_data(
    p_full_name VARCHAR(255),
    p_email VARCHAR(255) DEFAULT NULL,
    p_phone VARCHAR(20) DEFAULT NULL,
    p_date_of_birth DATE DEFAULT NULL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
BEGIN
    -- Kiểm tra tên không được rỗng
    IF p_full_name IS NULL OR TRIM(p_full_name) = '' THEN
        RETURN QUERY SELECT false, 'Họ tên không được để trống';
        RETURN;
    END IF;
    
    -- Kiểm tra email format nếu có
    IF p_email IS NOT NULL AND p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN QUERY SELECT false, 'Email không đúng định dạng';
        RETURN;
    END IF;
    
    -- Kiểm tra phone format nếu có
    IF p_phone IS NOT NULL AND p_phone !~ '^[0-9+\-\s()]{10,15}$' THEN
        RETURN QUERY SELECT false, 'Số điện thoại không đúng định dạng';
        RETURN;
    END IF;
    
    -- Kiểm tra ngày sinh hợp lệ
    IF p_date_of_birth IS NOT NULL AND p_date_of_birth > CURRENT_DATE THEN
        RETURN QUERY SELECT false, 'Ngày sinh không thể là tương lai';
        RETURN;
    END IF;
    
    -- Kiểm tra tuổi hợp lý (từ 5 đến 25 tuổi)
    IF p_date_of_birth IS NOT NULL AND (
        EXTRACT(YEAR FROM AGE(p_date_of_birth)) < 5 OR 
        EXTRACT(YEAR FROM AGE(p_date_of_birth)) > 25
    ) THEN
        RETURN QUERY SELECT false, 'Tuổi học sinh phải từ 5 đến 25 tuổi';
        RETURN;
    END IF;
    
    -- Nếu tất cả đều hợp lệ
    RETURN QUERY SELECT true, 'Dữ liệu hợp lệ'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Bước 15: Comments để giải thích
COMMENT ON TABLE students IS 'Bảng quản lý học sinh - ID tự động tạo theo format HS + năm + 6 số và dùng làm QR code';
COMMENT ON COLUMN students.id IS 'Mã học sinh dạng HS2025XXXXXX - đồng thời là QR code để điểm danh';
COMMENT ON COLUMN students.user_id IS 'Liên kết với bảng auth.users khi học sinh có tài khoản đăng nhập';
COMMENT ON COLUMN students.parent_zalo IS 'Số Zalo phụ huynh để gửi thông báo';
COMMENT ON COLUMN students.emergency_contact IS 'Thông tin liên hệ khẩn cấp dạng JSON';
COMMENT ON COLUMN students.medical_conditions IS 'Tình trạng sức khỏe đặc biệt';
COMMENT ON COLUMN students.academic_year IS 'Năm học theo format YYYY-YYYY';

COMMENT ON VIEW students_with_qr IS 'View hiển thị thông tin học sinh kèm QR code (dựa trên ID)';
COMMENT ON VIEW students_stats IS 'View thống kê chi tiết của học sinh bao gồm lớp học, thanh toán, điểm danh';

COMMENT ON FUNCTION generate_student_id() IS 'Function tạo ID học sinh theo format HS + năm + 6 số random';
COMMENT ON FUNCTION search_students(TEXT) IS 'Function tìm kiếm học sinh theo nhiều tiêu chí';
COMMENT ON FUNCTION validate_student_data(VARCHAR, VARCHAR, VARCHAR, DATE) IS 'Function kiểm tra tính hợp lệ của dữ liệu học sinh';

-- Bước 16: Kiểm tra kết quả
SELECT 
    'Tổng số học sinh' as metric,
    COUNT(*) as value
FROM students
UNION ALL
SELECT 
    'Học sinh có QR code' as metric,
    COUNT(*) as value
FROM students 
WHERE id IS NOT NULL
UNION ALL
SELECT 
    'Học sinh active' as metric,
    COUNT(*) as value
FROM students 
WHERE is_active = true;

-- Test function tìm kiếm
SELECT * FROM search_students('Nguyễn') LIMIT 5;

-- Test view
SELECT id, full_name, qr_code, has_qr_code FROM students_with_qr LIMIT 5;

-- Test validation
SELECT * FROM validate_student_data('Test Student', 'test@example.com', '0123456789', '2010-01-01');

COMMENT ON SCHEMA public IS 'Schema chính chứa bảng students với ID format custom làm QR code';
