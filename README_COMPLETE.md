# 🎓 Trung Tâm Luyện Thi - Education Management System

![Banner](https://img.shields.io/badge/Education-Management-blue) ![React](https://img.shields.io/badge/React-18.0+-61DAFB) ![Vite](https://img.shields.io/badge/Vite-4.0+-646CFF) ![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E) ![Material UI](https://img.shields.io/badge/Material--UI-5.0+-0081CB)

## 📋 Mô tả dự án

Hệ thống quản lý trung tâm luyện thi hiện đại với giao diện đẹp, tính năng đầy đủ và hỗ trợ thanh toán theo tháng.

### ✨ Tính năng chính

#### 🎯 **Dành cho Học sinh:**
- 📊 **Dashboard hiện đại** với thống kê trực quan
- 💰 **Thanh toán theo tháng** với giao diện gradient đẹp mắt
- 📅 **Điểm danh QR Code** tiện lợi
- 📚 **Quản lý lớp học** đang tham gia
- 📈 **Theo dõi tiến độ học tập**
- 🧾 **Xem biên lai thanh toán** chi tiết

#### 👨‍🏫 **Dành cho Giáo viên:**
- 📝 **Quản lý lớp học** được phân công
- ✅ **Điểm danh học sinh** nhanh chóng
- 📊 **Thống kê tham dự** chi tiết
- 🎯 **Quản lý điểm số** học sinh

#### 👩‍💼 **Dành cho Quản trị viên:**
- 🏫 **Quản lý tổng thể** trung tâm
- 👥 **Quản lý người dùng** (học sinh, giáo viên)
- 💼 **Quản lý lớp học và môn học**
- 💳 **Quản lý thanh toán** và báo cáo
- 📈 **Thống kê và báo cáo** toàn diện

## 🚀 Cài đặt và chạy dự án

### 📋 Yêu cầu hệ thống
- Node.js v18+ 
- npm v8+
- Supabase account

### 📦 Cài đặt

1. **Clone dự án:**
```bash
git clone <repository-url>
cd DoAnChuyenNganh
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Cấu hình môi trường:**
```bash
# Tạo file .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Cài đặt cơ sở dữ liệu:**
```sql
-- Chạy các file SQL theo thứ tự:
1. complete_database_structure.sql     -- Cấu trúc database đầy đủ
2. fix_database_issues.sql            -- Sửa các lỗi thiếu cột
3. sample_data.sql                    -- Dữ liệu mẫu (tùy chọn)
```

5. **Khởi chạy ứng dụng:**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3001`

## 🗃️ Cấu trúc Database

### 📊 **Các bảng chính:**

#### 👥 **Quản lý người dùng:**
- `students` - Thông tin học sinh
- `teachers` - Thông tin giáo viên  
- `user_profiles` - Hồ sơ người dùng

#### 🏫 **Quản lý học tập:**
- `subjects` - Môn học
- `classes` - Lớp học
- `enrollments` - Đăng ký học
- `schedules` - Lịch học

#### 📊 **Theo dõi và đánh giá:**
- `attendance` - Điểm danh
- `grades` - Điểm số
- `payments` - Thanh toán
- `notifications` - Thông báo

### 🔧 **Các cột quan trọng đã thêm:**
- ✅ `tuition_fee`, `monthly_fee` trong `classes`
- ✅ `phone` trong `students`, `teachers`, `user_profiles`
- ✅ `student_code` trong `students`
- ✅ `receipt_number`, `month_year` trong `payments`
- ✅ `qr_code` trong `students`

## 🎨 Giao diện hiện đại

### 🌈 **Thiết kế Features:**
- **Gradient backgrounds** đa dạng và đẹp mắt
- **Glass morphism** với backdrop blur
- **Hover effects** mượt mà
- **Responsive design** trên mọi thiết bị
- **Dark/Light themes** (sẵn sàng)

### 💳 **Hệ thống thanh toán:**
- **Monthly payment breakdown** chi tiết
- **Payment timeline** trực quan
- **Beautiful receipts** với QR code
- **Payment status tracking** realtime

### 📱 **Mobile-first design:**
- Tối ưu cho điện thoại và tablet
- Touch-friendly interface
- Responsive grid system

## 🔒 Bảo mật

### 🛡️ **Row Level Security (RLS):**
- Students chỉ xem được dữ liệu của mình
- Teachers chỉ truy cập lớp được phân công
- Admins có quyền truy cập toàn bộ

### 🔐 **Authentication:**
- Supabase Auth integration
- Email/password authentication
- Role-based access control

## 📱 Responsive Design

### 📊 **Breakpoints:**
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** > 1024px

### 🎯 **Optimizations:**
- Lazy loading components
- Image optimization
- Bundle splitting
- Performance monitoring

## 🐛 Các lỗi đã sửa

### ❌ **Lỗi Database:**
- ✅ Thiếu cột `tuition_fee` trong bảng `classes`
- ✅ Thiếu cột `phone` trong các bảng user
- ✅ Thiếu cột `student_code` và `qr_code`
- ✅ Thiếu cột `receipt_number` trong payments

### ❌ **Lỗi Frontend:**
- ✅ Null/undefined errors trong service functions
- ✅ Date formatting issues
- ✅ Missing error handling
- ✅ UI/UX improvements

### ❌ **Lỗi Logic:**
- ✅ Payment calculation errors
- ✅ Attendance tracking issues
- ✅ Data validation problems

## 📂 Cấu trúc thư mục

```
src/
├── components/          # Reusable components
│   └── common/         # Common UI components
├── contexts/           # React contexts
├── layouts/            # Layout components
├── pages/              # Page components
│   ├── admin/         # Admin pages
│   ├── auth/          # Authentication pages
│   └── user/          # User pages
├── routes/            # Routing configuration
└── services/          # API services
    └── supabase/      # Supabase services
```

## 🛠️ Công nghệ sử dụng

### 🎯 **Frontend:**
- **React 18** - UI framework
- **Vite** - Build tool
- **Material-UI v5** - Component library
- **React Router** - Routing
- **Day.js** - Date handling

### 🗄️ **Backend:**
- **Supabase** - Database & Auth
- **PostgreSQL** - Database engine
- **Row Level Security** - Data security

### 📊 **Additional Libraries:**
- **QRCode.react** - QR code generation
- **File-saver** - File downloads
- **XLSX** - Excel export
- **React Hook Form** - Form handling

## 🔧 Scripts

```bash
# Development
npm run dev              # Khởi chạy dev server
npm run build           # Build production
npm run preview         # Preview production build

# Database
npm run db:reset        # Reset database
npm run db:seed         # Seed sample data
npm run db:migrate      # Run migrations
```

## 📝 To-Do List

### 🚀 **Upcoming Features:**
- [ ] Real-time notifications
- [ ] Advanced reporting
- [ ] Mobile app version
- [ ] Integration with payment gateways
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### 🔧 **Technical Improvements:**
- [ ] Add unit tests
- [ ] Setup CI/CD pipeline
- [ ] Performance optimizations
- [ ] SEO improvements
- [ ] PWA features

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- **Email:** admin@trungtamluyenthi.edu.vn
- **Phone:** 0123456789
- **Website:** [trungtamluyenthi.edu.vn](https://trungtamluyenthi.edu.vn)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Supabase](https://supabase.com/)
- [Vite](https://vitejs.dev/)

---

<div align="center">
  <p><strong>🌟 Nơi ươm mầm tương lai 🌟</strong></p>
  <p>Made with ❤️ by Education Team</p>
</div>
