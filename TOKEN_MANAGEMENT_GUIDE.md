# HƯỚNG DẪN XỬ LÝ TOKEN VÀ PHIÊN ĐĂNG NHẬP

## ✅ CÁC CẢI TIẾN ĐÃ THỰC HIỆN

### 🔐 **Token Management nâng cao:**

1. **Auto-refresh Token**
   - Token tự động refresh trước khi hết hạn 5 phút
   - Phát hiện token expired và tự động đăng xuất
   - Kiểm tra token định kỳ mỗi phút

2. **Auto Logout**
   - Tự động đăng xuất khi token hết hạn
   - Timeout được set ngay khi login
   - Clear timeout khi logout thủ công

3. **Session Timer UI**
   - Hiển thị thời gian còn lại của phiên
   - Thay đổi màu sắc khi sắp hết hạn
   - Button refresh token thủ công
   - Tooltip hiển thị thời gian hết hạn chính xác

### 🎯 **Xử lý lỗi đăng nhập:**

1. **Error Handling chi tiết**
   - Phân biệt các loại lỗi khác nhau
   - Thông báo lỗi bằng tiếng Việt
   - Xử lý lỗi mạng, quá nhiều requests, etc.

2. **Login Form cải thiện**
   - Validation email/phone number
   - Loading states
   - Error display

### ⏰ **Session Lifecycle:**

```
Login → Set Token → Setup Auto Logout → Monitor Token → Auto Refresh → Expire → Auto Logout
```

## 🚀 TÍNH NĂNG MỚI

### **SessionTimer Component**
- Đặt trong AdminLayout header
- Hiển thị thời gian còn lại của phiên
- Màu sắc thay đổi:
  - 🟢 Xanh: > 5 phút
  - 🟡 Vàng: 1-5 phút  
  - 🔴 Đỏ: < 1 phút hoặc hết hạn
- Button refresh token

### **AuthContext cải tiến**
- Theo dõi session info chi tiết
- Auto logout timer
- Token refresh logic
- Error handling

### **Login Page cải tiến**  
- Better error messages
- Loading states
- Email/phone validation
- Auto redirect based on role

## 📱 HƯỚNG DẪN SỬ DỤNG

### **Đối với User:**
1. Đăng nhập bình thường
2. Quan sát SessionTimer ở góc phải header
3. Token sẽ tự động refresh trước khi hết hạn
4. Nếu cần thiết, click nút refresh để gia hạn thủ công
5. Hệ thống sẽ tự động đăng xuất khi hết thời gian

### **Token Timing:**
- **Default expiry**: 1 giờ (có thể config trong Supabase)
- **Auto refresh**: Khi còn 5 phút
- **Check interval**: Mỗi 1 phút
- **Warning**: Khi còn 5 phút (màu vàng)
- **Critical**: Khi còn 1 phút (màu đỏ)

## 🔧 CONFIGURATION

### **Supabase Settings**
Token expiry time được config trong Supabase Dashboard:
- Authentication → Settings → JWT expiry
- Recommended: 3600 seconds (1 hour)

### **Auto Refresh Settings**
```javascript
// Trong AuthContext.jsx
const REFRESH_THRESHOLD = 300; // 5 phút
const CHECK_INTERVAL = 60000; // 1 phút
```

### **Session Display**
```javascript
// Trong SessionTimer.jsx
const WARNING_THRESHOLD = 300; // 5 phút
const CRITICAL_THRESHOLD = 60;  // 1 phút
```

## 🛠️ TROUBLESHOOTING

### **Lỗi đăng nhập:**
1. Kiểm tra internet connection
2. Verify Supabase environment variables
3. Check console logs for detailed errors
4. Kiểm tra email/phone format

### **Token issues:**
1. Clear browser localStorage
2. Force refresh page
3. Check Supabase project status
4. Verify JWT settings

### **Auto logout không hoạt động:**
1. Check console logs
2. Verify timer setup
3. Test token expiration manually

## 📊 MONITORING

### **Console Logs để theo dõi:**
- `🔐 Auth state changed`
- `🔄 Token refreshed`
- `⏰ Auto logout scheduled`
- `⚠️ Token sắp hết hạn`
- `🚪 Auto logout triggered`

### **SessionInfo Object:**
```javascript
{
  expiresAt: 1609459200,           // timestamp
  expiresAtFormatted: "01/01/2021, 12:00:00 PM",
  timeUntilExpiry: 3600            // seconds
}
```

## 🎉 KẾT QUẢ

✅ **Đăng nhập mượt mà** với xử lý lỗi tốt  
✅ **Token tự động refresh** không làm gián đoạn user  
✅ **Auto logout** bảo mật khi hết phiên  
✅ **UI hiển thị session** trực quan và thông tin  
✅ **Error handling** chi tiết bằng tiếng Việt  

Người dùng giờ có thể đăng nhập an toàn với phiên làm việc được quản lý tự động!
