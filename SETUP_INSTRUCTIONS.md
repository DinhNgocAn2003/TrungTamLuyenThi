# Hướng dẫn cài đặt cơ sở dữ liệu

## Cập nhật cơ sở dữ liệu để hỗ trợ tính năng quản lý giáo viên mở rộng

Để sử dụng đầy đủ tính năng quản lý giáo viên với các trường mới, bạn cần chạy script SQL sau trong Supabase:

### Bước 1: Đăng nhập vào Supabase Dashboard
1. Truy cập https://supabase.com và đăng nhập
2. Chọn project của bạn
3. Vào tab "SQL Editor"

### Bước 2: Chạy script cập nhật database
Mở file `update_teachers_database.sql` và copy toàn bộ nội dung, sau đó paste vào SQL Editor và chạy.

Script này sẽ:
- Thêm các trường mới vào bảng `teachers`: `year_graduation`, `university`, `degree`, `notes`
- Tạo bảng `grades` (lớp/khối học)
- Tạo bảng `subjects_grades` (kết hợp môn học và lớp)
- Tạo bảng `teacher_subjects_grades` (quan hệ nhiều-nhiều giữa giáo viên và môn học-lớp)
- Thêm dữ liệu mẫu cho các lớp từ 6-12
- Tạo các subjects_grades kết hợp cho các môn học chính

### Bước 3: Kiểm tra kết quả
Sau khi chạy script thành công, bạn sẽ có:
- Bảng teachers với các trường mới
- Dữ liệu lớp học từ Lớp 6 đến Lớp 12
- Kết hợp môn học-lớp cho các môn: Toán học, Vật lý, Hóa học, Tiếng Anh, Ngữ văn, Sinh học

### Bước 4: Cập nhật RLS (Row Level Security) nếu cần
Nếu project của bạn sử dụng RLS, có thể cần thêm policies cho các bảng mới:

```sql
-- Policy cho bảng grades
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read grades" ON grades FOR SELECT USING (true);

-- Policy cho bảng subjects_grades  
ALTER TABLE subjects_grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read subjects_grades" ON subjects_grades FOR SELECT USING (true);

-- Policy cho bảng teacher_subjects_grades
ALTER TABLE teacher_subjects_grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations teacher_subjects_grades" ON teacher_subjects_grades USING (true);
```

## Tính năng mới sau khi cập nhật

1. **Thông tin chi tiết giáo viên:**
   - Năm tốt nghiệp
   - Trường đại học
   - Bằng cấp (Cử nhân/Thạc sĩ/Tiến sĩ)
   - Ghi chú

2. **Quản lý môn học giảng dạy:**
   - Chọn nhiều môn học và lớp mà giáo viên có thể giảng dạy
   - Hiển thị danh sách môn học-lớp dưới dạng chips

3. **Validation cải thiện:**
   - Bắt buộc nhập số điện thoại
   - Validation năm tốt nghiệp (1950 - hiện tại)

4. **Giao diện cải thiện:**
   - Form có layout grid responsive
   - Autocomplete cho việc chọn môn học-lớp
   - Hiển thị thông tin chi tiết hơn

## Lưu ý quan trọng
- Backup dữ liệu trước khi chạy script
- Script được thiết kế để an toàn với dữ liệu hiện có (sử dụng `IF NOT EXISTS` và `ON CONFLICT`)
- Nếu gặp lỗi, kiểm tra xem các bảng `subjects` đã tồn tại chưa
