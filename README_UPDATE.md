# HƯỚNG DẪN CẬP NHẬT CƠ SỞ DỮ LIỆU CHO TÍNH NĂNG QUẢN LÝ GIÁO VIÊN

## Tình trạng hiện tại
✅ Code đã được cập nhật hoàn chỉnh cho tính năng quản lý giáo viên nâng cao
✅ Ứng dụng đang chạy tại: http://localhost:3000/

## CẦN THỰC HIỆN
⚠️ **QUAN TRỌNG**: Bạn cần chạy script SQL để cập nhật cơ sở dữ liệu trước khi sử dụng tính năng mới.

### Bước 1: Chạy script SQL
1. Mở Supabase Dashboard của dự án
2. Vào phần SQL Editor
3. Sao chép và chạy nội dung file `update_teachers_database.sql`

### Bước 2: Kiểm tra kết quả
Sau khi chạy script, bạn sẽ có:
- ✅ Bảng `teachers` với các cột mới: year_graduation, university, degree, notes
- ✅ Bảng `grades` (khối lớp): Lớp 6-12
- ✅ Bảng `subjects_grades` (môn học-khối kết hợp)
- ✅ Bảng `teacher_subjects_grades` (quan hệ giáo viên - môn học - khối)

### Bước 3: Truy cập tính năng
1. Mở http://localhost:3000/
2. Đăng nhập với quyền Admin
3. Vào menu "Quản lý giáo viên"

## CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH

### 1. ✅ Xóa dữ liệu mẫu
- Loại bỏ tất cả dữ liệu mẫu từ các trang
- Ứng dụng sạch, sẵn sàng cho dữ liệu thực

### 2. ✅ Quản lý giáo viên nâng cao
- CRUD đầy đủ (Thêm, Sửa, Xóa, Xem)
- Tìm kiếm và lọc
- Xuất danh sách Excel
- Form với validation bắt buộc

### 3. ✅ Thông tin giáo viên mở rộng
- Thông tin cơ bản: Họ tên, SĐT*, Email*, Địa chỉ, Chuyên môn
- Thông tin học vấn: Năm tốt nghiệp, Trường đại học, Bằng cấp
- Kinh nghiệm giảng dạy: Số năm kinh nghiệm
- Phân công giảng dạy: Chọn môn học và khối lớp
- Ghi chú bổ sung

### 4. ✅ Loại bỏ phụ thuộc ngày tháng
- Quản lý lớp học không còn phụ thuộc start_date/end_date
- Simplified class management

### 5. ✅ Validation bắt buộc
- Họ tên (bắt buộc)
- Số điện thoại (bắt buộc)
- Email (bắt buộc)

## NOTES
- Trường được đánh dấu (*) là bắt buộc
- Bảng `grades` lưu thông tin khối lớp (6-12)
- Bảng `scores` lưu điểm kiểm tra (không thay đổi)
- Quan hệ many-to-many giữa giáo viên và môn học-khối
