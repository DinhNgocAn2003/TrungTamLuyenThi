-- Dữ liệu mẫu cho hệ thống quản lý luyện thi
-- Chạy sau khi đã tạo structure và functions

-- 1. Thêm môn học mẫu
INSERT INTO subjects (name, description) VALUES
('Toán học', 'Môn Toán từ cơ bản đến nâng cao'),
('Vật lý', 'Môn Vật lý THPT và luyện thi đại học'),
('Hóa học', 'Môn Hóa học từ cơ bản đến nâng cao'),
('Tiếng Anh', 'Tiếng Anh giao tiếp và luyện thi'),
('Ngữ văn', 'Môn Văn THPT và luyện thi đại học'),
('Sinh học', 'Môn Sinh học THPT')
ON CONFLICT (name) DO NOTHING;

-- 2. Thêm giáo viên mẫu
INSERT INTO teachers (full_name, phone, email, address, specialization, experience_years) VALUES
('Nguyễn Văn An', '0901234567', 'an.nguyen@email.com', 'Hà Nội', 'Toán học', 5),
('Trần Thị Bình', '0902345678', 'binh.tran@email.com', 'Hà Nội', 'Vật lý', 8),
('Lê Văn Cường', '0903456789', 'cuong.le@email.com', 'Hà Nội', 'Hóa học', 6),
('Phạm Thị Dung', '0904567890', 'dung.pham@email.com', 'Hà Nội', 'Tiếng Anh', 10),
('Hoàng Văn Em', '0905678901', 'em.hoang@email.com', 'Hà Nội', 'Ngữ văn', 7),
('Ngô Thị Phương', '0906789012', 'phuong.ngo@email.com', 'Hà Nội', 'Sinh học', 4);

-- 3. Thêm lớp học mẫu
INSERT INTO classes (name, subject_id, description, start_date, end_date, max_students, tuition_fee, status) VALUES
(
    'Toán 12 - Luyện thi THPT QG 2024',
    (SELECT id FROM subjects WHERE name = 'Toán học'),
    'Lớp luyện thi THPT Quốc gia môn Toán',
    '2024-01-15',
    '2024-05-15',
    25,
    2500000,
    'active'
),
(
    'Vật lý 12 - Cơ bản',
    (SELECT id FROM subjects WHERE name = 'Vật lý'),
    'Lớp Vật lý 12 cơ bản',
    '2024-01-20',
    '2024-05-20',
    20,
    2200000,
    'active'
),
(
    'Hóa học 11',
    (SELECT id FROM subjects WHERE name = 'Hóa học'),
    'Lớp Hóa học lớp 11',
    '2024-02-01',
    '2024-06-01',
    18,
    2000000,
    'active'
),
(
    'Tiếng Anh Giao tiếp',
    (SELECT id FROM subjects WHERE name = 'Tiếng Anh'),
    'Lớp Tiếng Anh giao tiếp cơ bản',
    '2024-01-10',
    '2024-04-10',
    15,
    1800000,
    'active'
),
(
    'Ngữ văn 12',
    (SELECT id FROM subjects WHERE name = 'Ngữ văn'),
    'Lớp Ngữ văn lớp 12',
    '2023-09-01',
    '2023-12-31',
    22,
    2100000,
    'completed'
);

-- 4. Thêm lịch học mẫu
INSERT INTO class_schedules (class_id, day_of_week, start_time, end_time, location) VALUES
-- Toán 12 - Thứ 2, 4, 6
((SELECT id FROM classes WHERE name = 'Toán 12 - Luyện thi THPT QG 2024'), 1, '18:00', '20:00', 'Phòng A1'),
((SELECT id FROM classes WHERE name = 'Toán 12 - Luyện thi THPT QG 2024'), 3, '18:00', '20:00', 'Phòng A1'),
((SELECT id FROM classes WHERE name = 'Toán 12 - Luyện thi THPT QG 2024'), 5, '18:00', '20:00', 'Phòng A1'),

-- Vật lý 12 - Thứ 3, 5, 7
((SELECT id FROM classes WHERE name = 'Vật lý 12 - Cơ bản'), 2, '19:00', '21:00', 'Phòng B1'),
((SELECT id FROM classes WHERE name = 'Vật lý 12 - Cơ bản'), 4, '19:00', '21:00', 'Phòng B1'),
((SELECT id FROM classes WHERE name = 'Vật lý 12 - Cơ bản'), 6, '19:00', '21:00', 'Phòng B1'),

-- Hóa học 11 - Thứ 2, 4
((SELECT id FROM classes WHERE name = 'Hóa học 11'), 1, '20:00', '22:00', 'Phòng C1'),
((SELECT id FROM classes WHERE name = 'Hóa học 11'), 3, '20:00', '22:00', 'Phòng C1'),

-- Tiếng Anh - Thứ 3, 5
((SELECT id FROM classes WHERE name = 'Tiếng Anh Giao tiếp'), 2, '18:00', '20:00', 'Phòng D1'),
((SELECT id FROM classes WHERE name = 'Tiếng Anh Giao tiếp'), 4, '18:00', '20:00', 'Phòng D1');

-- 5. Phân công giáo viên
INSERT INTO class_teachers (class_id, teacher_id, is_main) VALUES
-- Toán 12
((SELECT id FROM classes WHERE name = 'Toán 12 - Luyện thi THPT QG 2024'), (SELECT id FROM teachers WHERE full_name = 'Nguyễn Văn An'), true),

-- Vật lý 12
((SELECT id FROM classes WHERE name = 'Vật lý 12 - Cơ bản'), (SELECT id FROM teachers WHERE full_name = 'Trần Thị Bình'), true),

-- Hóa học 11
((SELECT id FROM classes WHERE name = 'Hóa học 11'), (SELECT id FROM teachers WHERE full_name = 'Lê Văn Cường'), true),

-- Tiếng Anh
((SELECT id FROM classes WHERE name = 'Tiếng Anh Giao tiếp'), (SELECT id FROM teachers WHERE full_name = 'Phạm Thị Dung'), true),

-- Ngữ văn 12
((SELECT id FROM classes WHERE name = 'Ngữ văn 12'), (SELECT id FROM teachers WHERE full_name = 'Hoàng Văn Em'), true);

-- 6. Thêm học sinh mẫu
INSERT INTO students (full_name, date_of_birth, gender, address, phone, email, parent_name, parent_phone, parent_zalo, school, grade, notes) VALUES
('Nguyễn Văn A', '2006-01-15', 'male', '123 Phố Huế, Hà Nội', '0987654321', 'vana@email.com', 'Nguyễn Văn B', '0912345678', '0912345678', 'THPT Chu Văn An', '12', 'Học sinh giỏi'),
('Trần Thị B', '2006-03-20', 'female', '456 Láng Hạ, Hà Nội', '0987654322', 'thib@email.com', 'Trần Văn C', '0912345679', '0912345679', 'THPT Lương Thế Vinh', '12', ''),
('Lê Văn C', '2007-05-10', 'male', '789 Cầu Giấy, Hà Nội', '0987654323', 'vanc@email.com', 'Lê Thị D', '0912345680', '0912345680', 'THPT Cầu Giấy', '11', ''),
('Phạm Thị D', '2006-07-25', 'female', '321 Tây Hồ, Hà Nội', '0987654324', 'thid@email.com', 'Phạm Văn E', '0912345681', '0912345681', 'THPT Tây Hồ', '12', 'Học sinh khá'),
('Hoàng Văn E', '2007-02-14', 'male', '654 Đống Đa, Hà Nội', '0987654325', 'vane@email.com', 'Hoàng Thị F', '0912345682', '0912345682', 'THPT Đống Đa', '11', ''),
('Ngô Thị F', '2006-11-30', 'female', '987 Ba Đình, Hà Nội', '0987654326', 'thif@email.com', 'Ngô Văn G', '0912345683', '0912345683', 'THPT Ba Đình', '12', ''),
('Vũ Văn G', '2007-04-18', 'male', '147 Hoàng Mai, Hà Nội', '0987654327', 'vang@email.com', 'Vũ Thị H', '0912345684', '0912345684', 'THPT Hoàng Mai', '11', ''),
('Bùi Thị H', '2006-09-12', 'female', '258 Long Biên, Hà Nội', '0987654328', 'thih@email.com', 'Bùi Văn I', '0912345685', '0912345685', 'THPT Long Biên', '12', '');

-- 7. Đăng ký lớp học
INSERT INTO class_enrollments (class_id, student_id, enrollment_date, status) VALUES
-- Toán 12
((SELECT id FROM classes WHERE name = 'Toán 12 - Luyện thi THPT QG 2024'), (SELECT id FROM students WHERE full_name = 'Nguyễn Văn A'), '2024-01-10', 'active'),
((SELECT id FROM classes WHERE name = 'Toán 12 - Luyện thi THPT QG 2024'), (SELECT id FROM students WHERE full_name = 'Trần Thị B'), '2024-01-12', 'active'),
((SELECT id FROM classes WHERE name = 'Toán 12 - Luyện thi THPT QG 2024'), (SELECT id FROM students WHERE full_name = 'Phạm Thị D'), '2024-01-15', 'active'),
((SELECT id FROM classes WHERE name = 'Toán 12 - Luyện thi THPT QG 2024'), (SELECT id FROM students WHERE full_name = 'Ngô Thị F'), '2024-01-18', 'active'),

-- Vật lý 12
((SELECT id FROM classes WHERE name = 'Vật lý 12 - Cơ bản'), (SELECT id FROM students WHERE full_name = 'Nguyễn Văn A'), '2024-01-18', 'active'),
((SELECT id FROM classes WHERE name = 'Vật lý 12 - Cơ bản'), (SELECT id FROM students WHERE full_name = 'Phạm Thị D'), '2024-01-20', 'active'),
((SELECT id FROM classes WHERE name = 'Vật lý 12 - Cơ bản'), (SELECT id FROM students WHERE full_name = 'Bùi Thị H'), '2024-01-22', 'active'),

-- Hóa học 11
((SELECT id FROM classes WHERE name = 'Hóa học 11'), (SELECT id FROM students WHERE full_name = 'Lê Văn C'), '2024-01-30', 'active'),
((SELECT id FROM classes WHERE name = 'Hóa học 11'), (SELECT id FROM students WHERE full_name = 'Hoàng Văn E'), '2024-02-01', 'active'),
((SELECT id FROM classes WHERE name = 'Hóa học 11'), (SELECT id FROM students WHERE full_name = 'Vũ Văn G'), '2024-02-03', 'active'),

-- Tiếng Anh
((SELECT id FROM classes WHERE name = 'Tiếng Anh Giao tiếp'), (SELECT id FROM students WHERE full_name = 'Trần Thị B'), '2024-01-08', 'active'),
((SELECT id FROM classes WHERE name = 'Tiếng Anh Giao tiếp'), (SELECT id FROM students WHERE full_name = 'Ngô Thị F'), '2024-01-10', 'active');

-- 8. Thêm dữ liệu điểm danh mẫu (30 ngày gần đây)
-- Tạo dữ liệu điểm danh cho mỗi lớp
DO $$
DECLARE
    class_rec RECORD;
    student_rec RECORD;
    attendance_date DATE;
    random_status BOOLEAN;
BEGIN
    -- Lặp qua các lớp đang hoạt động
    FOR class_rec IN 
        SELECT id, name FROM classes WHERE status = 'active'
    LOOP
        -- Lặp qua các học sinh trong lớp
        FOR student_rec IN 
            SELECT s.id 
            FROM students s 
            JOIN class_enrollments ce ON s.id = ce.student_id 
            WHERE ce.class_id = class_rec.id AND ce.status = 'active'
        LOOP
            -- Tạo điểm danh cho 20 ngày gần đây
            FOR i IN 1..20 LOOP
                attendance_date := CURRENT_DATE - (i || ' days')::INTERVAL;
                -- Random có mặt/vắng mặt (80% có mặt, 20% vắng)
                random_status := (random() > 0.2);
                
                INSERT INTO attendance (class_id, student_id, date, status, notes)
                VALUES (
                    class_rec.id, 
                    student_rec.id, 
                    attendance_date, 
                    random_status,
                    CASE WHEN random_status THEN 'Có mặt' ELSE 'Vắng mặt' END
                )
                ON CONFLICT (class_id, student_id, date) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- 9. Thêm thanh toán mẫu (một số học sinh đã đóng, một số chưa)
INSERT INTO payments (student_id, class_id, amount, payment_date, payment_method, status, notes, receipt_number)
SELECT 
    ce.student_id,
    ce.class_id,
    c.tuition_fee,
    ce.enrollment_date + INTERVAL '5 days',
    'cash',
    'completed',
    'Thanh toán học phí',
    'RC' || lpad(generate_random_between(100000, 999999)::text, 6, '0')
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
WHERE random() > 0.3; -- 70% học sinh đã thanh toán

-- Helper function for random between
CREATE OR REPLACE FUNCTION generate_random_between(low INT, high INT) 
RETURNS INT AS $$
BEGIN
   RETURN floor(random() * (high - low + 1) + low);
END;
$$ LANGUAGE plpgsql;

-- 10. Thêm kỳ thi mẫu
INSERT INTO exams (class_id, title, exam_date, duration, max_score, description) VALUES
((SELECT id FROM classes WHERE name = 'Toán 12 - Luyện thi THPT QG 2024'), 'Kiểm tra giữa kỳ', '2024-03-15', 90, 10.0, 'Kiểm tra 15 tiết đầu'),
((SELECT id FROM classes WHERE name = 'Vật lý 12 - Cơ bản'), 'Kiểm tra chương 1', '2024-03-20', 60, 10.0, 'Kiểm tra chương Dao động cơ'),
((SELECT id FROM classes WHERE name = 'Hóa học 11'), 'Bài kiểm tra 15p', '2024-03-10', 15, 10.0, 'Kiểm tra nhanh');

-- 11. Thêm kết quả thi mẫu
INSERT INTO exam_results (exam_id, student_id, score, notes)
SELECT 
    e.id,
    ce.student_id,
    ROUND((random() * 5 + 5)::numeric, 2), -- Điểm từ 5.0 đến 10.0
    'Kết quả tốt'
FROM exams e
JOIN class_enrollments ce ON e.class_id = ce.class_id
WHERE ce.status = 'active'
AND random() > 0.2; -- 80% học sinh có điểm

-- 12. Thêm thông báo mẫu
INSERT INTO notifications (student_id, type, message, zalo_status) VALUES
((SELECT id FROM students WHERE full_name = 'Nguyễn Văn A'), 'general', 'Thông báo lịch nghỉ lễ 30/4 - 1/5', 'sent'),
((SELECT id FROM students WHERE full_name = 'Trần Thị B'), 'absence', 'Con em đã vắng 3 buổi học liên tiếp', 'sent'),
((SELECT id FROM students WHERE full_name = 'Lê Văn C'), 'payment', 'Nhắc nhở đóng học phí lớp Hóa học 11', 'pending');

-- Cập nhật thống kê
ANALYZE;
