# TÍNH NĂNG PHÂN CÔNG GIÁO VIÊN - MÔN HỌC - LỚP

## 🎯 TỔNG QUAN

Thay vì sử dụng combobox đơn lẻ để chọn chuyên môn, hệ thống giờ đây hỗ trợ **phân công nhiều môn-lớp** cho mỗi giáo viên thông qua component `SubjectGradeSelector`.

## 🗃️ CẤU TRÚC DATABASE

### **Các bảng liên quan:**

1. **`subjects`** - Môn học
   - `id`, `name`, `description`

2. **`classes`** - Lớp học  
   - `id`, `name`, `grade` (6-12)

3. **`subjects_grades`** - Bảng nhiều-nhiều (môn học - lớp)
   - `id`, `subject_id`, `class_id`
   - Unique constraint: (subject_id, class_id)

4. **`teachers_subjects_grades`** - Bảng nhiều-nhiều-nhiều (giáo viên - môn học - lớp)
   - `id`, `teacher_id`, `subjects_grades_id`
   - Unique constraint: (teacher_id, subjects_grades_id)

### **Mối quan hệ:**
```
Teachers (1) ←→ (N) Teachers_Subjects_Grades (N) ←→ (1) Subjects_Grades
                                                              ↓
                                            Subjects (1) ←→ (N) + (N) ←→ (1) Classes
```

## 🔧 TÍNH NĂNG MỚI

### **SubjectGradeSelector Component**

**Props:**
- `teacherId`: ID của giáo viên
- `selectedSubjectGrades`: Danh sách phân công hiện tại
- `onSelectionChange`: Callback khi thay đổi
- `subjects`: Danh sách môn học
- `grades`: Danh sách lớp học
- `disabled`: Chế độ chỉ đọc

**Tính năng:**
✅ **Chọn nhiều môn-lớp** cùng lúc  
✅ **Tự động tạo** subject-grade combination nếu chưa tồn tại  
✅ **Hiển thị dạng Chips** với màu sắc phân biệt  
✅ **Validation** chống duplicate  
✅ **Read-only mode** cho việc xem thông tin  
✅ **Loading states** khi xử lý dữ liệu  

## 🎨 GIAO DIỆN NGƯỜI DÙNG

### **1. Trong Dialog thêm/sửa giáo viên:**
- Component xuất hiện ở cuối form
- Card với header "Môn học - Lớp được phân công"
- Button "Thêm phân công" để mở dialog chọn
- Hiển thị các phân công dưới dạng chips

### **2. Dialog chọn môn-lớp:**
- Dropdown chọn môn học
- Dropdown chọn lớp
- Preview phân công sẽ thêm
- Danh sách phân công hiện tại với option xóa

### **3. Trong bảng danh sách giáo viên:**
- Cột "Phân công" hiển thị số lượng môn-lớp
- Tab "Phân công giảng dạy" trong expanded row
- Hiển thị chi tiết tất cả phân công

## 📋 HƯỚNG DẪN SỬ DỤNG

### **Thêm phân công cho giáo viên:**

1. **Mở dialog thêm/sửa giáo viên**
2. **Cuộn xuống section "Môn học - Lớp được phân công"**
3. **Click "Thêm phân công"**
4. **Chọn môn học từ dropdown**
5. **Chọn lớp từ dropdown**  
6. **Click "Thêm phân công"**
7. **Lặp lại để thêm nhiều phân công**
8. **Save giáo viên**

### **Xem thông tin phân công:**

1. **Click vào arrow expand** ở đầu hàng giáo viên
2. **Chuyển sang tab "Phân công giảng dạy"**
3. **Xem danh sách đầy đủ** các môn-lớp được phân công

### **Xóa phân công:**

1. **Mở dialog sửa giáo viên**
2. **Click vào dấu X** trên chip phân công muốn xóa
3. **Save để xác nhận**

## 🔄 WORKFLOW XỬ LÝ DỮ LIỆU

### **Khi thêm phân công:**
1. Kiểm tra subject-grade combination đã tồn tại chưa
2. Nếu chưa → Tạo mới trong `subjects_grades`
3. Tạo record trong `teachers_subjects_grades`
4. Update UI với dữ liệu mới

### **Khi lưu giáo viên:**
1. Lưu thông tin cơ bản của giáo viên
2. Xóa tất cả phân công cũ của giáo viên
3. Thêm lại các phân công mới từ form
4. Refresh danh sách

### **Khi hiển thị:**
1. Join các bảng để lấy thông tin đầy đủ
2. Format dữ liệu cho UI component
3. Hiển thị dưới dạng chips hoặc danh sách

## 🛠️ SERVICES VÀ APIs

### **teacherAssignments.js:**
- `getTeacherSubjectGrades(teacherId)`
- `addTeacherSubjectGrade(teacherId, subjectGradeId)`
- `removeTeacherSubjectGrade(teacherId, subjectGradeId)`
- `updateTeacherSubjectGrades(teacherId, assignments)`
- `getSubjectGradeCombinations()`
- `createSubjectGradeCombination(subjectId, classId)`

### **Database migration:**
- Script SQL trong `sql/teacher_subject_grade_management.sql`
- Tạo bảng, indexes, RLS policies
- Insert dữ liệu mẫu cho classes
- Tạo view cho query dễ dàng

## 📊 HIỆU SUẤT VÀ TỐI ƯU

### **Indexes được tạo:**
```sql
CREATE INDEX idx_subjects_grades_subject_id ON subjects_grades(subject_id);
CREATE INDEX idx_subjects_grades_class_id ON subjects_grades(class_id);
CREATE INDEX idx_teachers_subjects_grades_teacher_id ON teachers_subjects_grades(teacher_id);
```

### **View tối ưu:**
```sql
CREATE VIEW teacher_assignments_view AS 
SELECT teacher_id, teacher_name, subject_name, class_name, grade_level
FROM teachers_subjects_grades tsg
JOIN subjects_grades sg ON tsg.subjects_grades_id = sg.id
-- ... joins
```

## 🚨 LƯU Ý QUAN TRỌNG

### **Database setup:**
1. **Chạy migration** `sql/teacher_subject_grade_management.sql` trước
2. **Kiểm tra** các bảng đã tạo đúng
3. **Insert** dữ liệu mẫu cho subjects và classes
4. **Test** RLS policies hoạt động

### **Error handling:**
- Xử lý lỗi khi tạo subject-grade combination
- Validation chống duplicate assignments  
- Loading states cho UX tốt hơn
- Rollback khi có lỗi

### **Performance:**
- Sử dụng indexes để tăng tốc query
- Batch operations khi có thể
- Limit số lượng phân công hợp lý
- Cache data ở client side

## 🎉 KẾT QUẢ

✅ **Flexible assignment:** Giáo viên có thể dạy nhiều môn nhiều lớp  
✅ **Better UX:** Interface trực quan với chips và dialogs  
✅ **Data integrity:** Constraints và validation đầy đủ  
✅ **Scalable:** Cấu trúc database mở rộng được  
✅ **Maintainable:** Code clean, services tách biệt  

Hệ thống giờ đây hỗ trợ **quản lý phân công giảng dạy linh hoạt và toàn diện** cho trung tâm luyện thi!
