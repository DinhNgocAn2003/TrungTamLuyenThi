# HƯỚNG DẪN TEST TÍNH NĂNG PHÂN CÔNG GIÁO VIÊN

## 🧪 TESTING WORKFLOW

### **1. Setup Database (Quan trọng!)**

Trước khi test, **PHẢI chạy migration script**:

1. Mở **Supabase Dashboard** → SQL Editor
2. Copy nội dung file `sql/teacher_subject_grade_management.sql`
3. **Execute script** để tạo các bảng cần thiết
4. Kiểm tra các bảng đã được tạo:
   - `classes`
   - `subjects_grades` 
   - `teachers_subjects_grades`

### **2. Test Scenarios**

#### **Scenario 1: Thêm giáo viên mới với phân công**
1. Vào trang **Quản lý Giáo viên**
2. Click **"Thêm giáo viên"**
3. Điền thông tin cơ bản
4. Scroll xuống **"Môn học - Lớp được phân công"**
5. Click **"Thêm phân công"**
6. Chọn môn học (VD: Toán)
7. Chọn lớp (VD: Lớp 10)
8. Click **"Thêm phân công"**
9. Repeat để thêm nhiều phân công
10. **Save giáo viên**

#### **Scenario 2: Sửa phân công giáo viên hiện tại**
1. Click **Edit** một giáo viên
2. Xem phân công hiện tại (nếu có)
3. Thêm phân công mới
4. Xóa phân công cũ (click X trên chip)
5. **Save changes**

#### **Scenario 3: Xem thông tin phân công**
1. Click **expand arrow** ở đầu hàng giáo viên
2. Chuyển sang tab **"Phân công giảng dạy"**
3. Xem danh sách môn-lớp được phân công
4. Kiểm tra hiển thị **read-only mode**

#### **Scenario 4: Kiểm tra validation**
1. Thử thêm **duplicate** môn-lớp → Không cho phép
2. Thử thêm phân công **không chọn môn** → Disabled button
3. Thử thêm phân công **không chọn lớp** → Disabled button

### **3. Expected Results**

#### **UI Checks:**
✅ Dialog phân công mở đúng  
✅ Dropdowns load data môn học và lớp  
✅ Chips hiển thị đẹp với tên môn-lớp  
✅ Button delete trên chips hoạt động  
✅ Count phân công trong bảng chính đúng  
✅ Tab expanded row hiển thị đúng  

#### **Data Checks:**
✅ Phân công được lưu vào database  
✅ Không tạo duplicate combinations  
✅ Xóa phân công hoạt động đúng  
✅ Load lại data sau khi save  

#### **Error Handling:**
✅ Loading states hiển thị  
✅ Error messages khi có lỗi  
✅ Validation messages rõ ràng  

### **4. Common Issues & Solutions**

#### **Lỗi "Table not found":**
```
Solution: Chạy migration script trong Supabase
```

#### **Lỗi "Subjects/Classes empty":**
```
Solution: 
1. Check subjects table có data
2. Check classes table có data
3. Check getSubjects() và getClasses() functions
```

#### **Lỗi "Permission denied":**
```
Solution:
1. Check RLS policies trong Supabase
2. Ensure user authenticated
3. Check adminClient permissions
```

#### **Component không render:**
```
Solution:
1. Check console logs for errors
2. Verify import paths
3. Check props passed correctly
```

### **5. Database Verification Queries**

Chạy trong Supabase SQL Editor để verify:

```sql
-- Check classes data
SELECT * FROM classes ORDER BY grade;

-- Check subject-grade combinations  
SELECT sg.*, s.name as subject_name, c.name as class_name 
FROM subjects_grades sg
JOIN subjects s ON sg.subject_id = s.id  
JOIN classes c ON sg.class_id = c.id;

-- Check teacher assignments
SELECT * FROM teacher_assignments_view 
ORDER BY teacher_name, subject_name, grade_level;

-- Count assignments per teacher
SELECT teacher_id, COUNT(*) as assignment_count
FROM teachers_subjects_grades 
GROUP BY teacher_id;
```

### **6. Manual Testing Checklist**

- [ ] Migration script executed successfully
- [ ] Classes table has 7 records (Lớp 6-12)  
- [ ] Subjects table has data
- [ ] TeacherManagement page loads without errors
- [ ] Add teacher dialog opens
- [ ] SubjectGradeSelector component renders
- [ ] "Thêm phân công" button works
- [ ] Subject dropdown populates
- [ ] Class dropdown populates  
- [ ] Can add multiple assignments
- [ ] Chips display correctly
- [ ] Can remove assignments via X button
- [ ] Save teacher with assignments works
- [ ] Assignment count shows in main table
- [ ] Expanded row shows assignment tab
- [ ] Read-only mode displays assignments
- [ ] Edit teacher loads existing assignments
- [ ] No duplicate assignments allowed

### **7. Performance Testing**

- Test với **50+ giáo viên** có nhiều phân công
- Test **concurrent users** thêm phân công
- Check **query performance** với nhiều data
- Monitor **loading times** của components

## 🎯 SUCCESS CRITERIA

Tính năng được coi là **thành công** khi:

1. ✅ **Database setup** hoàn thành không lỗi
2. ✅ **UI components** render và hoạt động mượt  
3. ✅ **CRUD operations** cho phân công hoạt động đúng
4. ✅ **Data integrity** được đảm bảo (no duplicates, constraints)
5. ✅ **Error handling** đầy đủ và user-friendly
6. ✅ **Performance** chấp nhận được với data thực tế

Happy testing! 🚀
