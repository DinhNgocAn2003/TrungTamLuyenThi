# DEMO DATA - Chuyên môn giáo viên

## 🎯 MỤC ĐÍCH
File này chứa dữ liệu mẫu để test tính năng **chuyên môn kết hợp** mới.

## 📋 DỮ LIỆU MẪU GIÁO VIÊN

### **Giáo viên 1: Nguyễn Văn An**
- **Chuyên môn**: `Toán 6, Toán 7, Toán 8`
- **Giải thích**: Dạy Toán cho 3 khối lớp THCS

### **Giáo viên 2: Trần Thị Bình**  
- **Chuyên môn**: `Vật lý 10, Vật lý 11, Vật lý 12`
- **Giải thích**: Dạy Vật lý cho cả khối THPT

### **Giáo viên 3: Lê Văn Cường**
- **Chuyên môn**: `Anh văn THCS, Anh văn THPT`
- **Giải thích**: Dạy Tiếng Anh cả THCS và THPT

### **Giáo viên 4: Phạm Thị Dung**
- **Chuyên môn**: `Văn 9, Văn 12, Lịch sử THPT`
- **Giải thích**: Đa dạng môn Xã hội

### **Giáo viên 5: Hoàng Văn Em**
- **Chuyên môn**: `Hóa học 9, Hóa học 10, Hóa học 11, Hóa học 12, Sinh học THPT`
- **Giải thích**: Chuyên các môn Tự nhiên

## 🔧 CÁC OPTION CHUYÊN MÔN AVAILABLE

### **Theo từng lớp cụ thể:**
- Toán 6, Toán 7, Toán 8, Toán 9, Toán 10, Toán 11, Toán 12
- Văn 6, Văn 7, Văn 8, Văn 9, Văn 10, Văn 11, Văn 12  
- Anh văn 6, Anh văn 7, Anh văn 8, Anh văn 9, Anh văn 10, Anh văn 11, Anh văn 12
- Vật lý 6, Vật lý 7, Vật lý 8, Vật lý 9, Vật lý 10, Vật lý 11, Vật lý 12
- Hóa học 8, Hóa học 9, Hóa học 10, Hóa học 11, Hóa học 12
- Sinh học 6, Sinh học 7, Sinh học 8, Sinh học 9, Sinh học 10, Sinh học 11, Sinh học 12

### **Theo cấp học:**
- Toán THCS (Lớp 6-9)
- Toán THPT (Lớp 10-12)
- Văn THCS
- Văn THPT  
- Anh văn THCS
- Anh văn THPT
- Vật lý THCS
- Vật lý THPT
- Hóa học THCS
- Hóa học THPT
- Sinh học THCS  
- Sinh học THPT
- Lịch sử THCS
- Lịch sử THPT
- Địa lý THCS
- Địa lý THPT

### **Môn khác:**
- Tin học
- Giáo dục công dân
- Thể dục
- Âm nhạc
- Mỹ thuật
- Công nghệ
- Khác

## 🎨 HIỂN THỊ TRONG UI

### **Trong bảng chính:**
- Hiển thị **tối đa 2 chuyên môn** đầu tiên
- Nếu nhiều hơn 2 → hiển thị `+N` (N = số còn lại)
- Ví dụ: `[Toán 6] [Toán 7] [+2]`

### **Trong dialog form:**
- **Autocomplete** với multiple selection
- **Chips** để hiển thị các chuyên môn đã chọn
- **freeSolo** để cho phép nhập tự do
- **Placeholder**: "Chọn các chuyên môn"

### **Trong expanded view:**
- Hiển thị **tất cả chuyên môn** dưới dạng chips
- Có icon **SchoolIcon** cho mỗi chip
- Layout flexWrap để tự động xuống hàng

## 🧪 TEST SCENARIOS

### **Test 1: Thêm nhiều chuyên môn**
1. Mở dialog thêm giáo viên
2. Nhấp vào field "Chuyên môn"  
3. Chọn: "Toán 6", "Toán 7", "Toán 8"
4. Verify 3 chips hiển thị
5. Save và kiểm tra lưu đúng

### **Test 2: FreeSolo input**
1. Mở dialog thêm giáo viên
2. Gõ "Toán luyện thi đại học" 
3. Nhấn Enter để thêm
4. Verify chip mới xuất hiện
5. Save và kiểm tra

### **Test 3: Hiển thị trong table**
1. Tạo giáo viên với 5 chuyên môn
2. Kiểm tra chỉ hiển thị 2 đầu + "+3"
3. Click expand để xem đầy đủ
4. Verify tất cả hiển thị trong detail

### **Test 4: Edit chuyên môn**
1. Edit giáo viên có sẵn chuyên môn
2. Xóa 1 chuyên môn (click X trên chip)
3. Thêm 1 chuyên môn mới
4. Save và verify thay đổi

### **Test 5: Search theo chuyên môn**
1. Tìm kiếm "Toán 6" trong search box
2. Verify giáo viên có chuyên môn "Toán 6" xuất hiện
3. Test với các từ khóa khác

## 💡 EXPECTED BEHAVIOR

✅ **Multiple selection** hoạt động smooth  
✅ **Chips display** đẹp và responsive  
✅ **Data persistence** lưu đúng format  
✅ **Search functionality** tìm được theo chuyên môn  
✅ **UI responsive** trên mobile  
✅ **Performance** tốt với nhiều data  

## 🚀 PRODUCTION READY

Tính năng này sẵn sàng để sử dụng thực tế tại trung tâm luyện thi với:

- **Flexibility**: Hỗ trợ mọi loại chuyên môn
- **User Experience**: UI/UX trực quan dễ dùng  
- **Data Integrity**: Format chuẩn, tìm kiếm tốt
- **Scalability**: Dễ mở rộng thêm môn học mới

Happy testing! 🎉
