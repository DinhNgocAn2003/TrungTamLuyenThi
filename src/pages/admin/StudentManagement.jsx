import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Divider, 
  Grid, 
  IconButton, 
  Paper, 
  Tab, 
  Tabs, 
  TextField, 
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import QrCodeIcon from '@mui/icons-material/QrCode';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import dayjs from 'dayjs';
import QRCode from 'qrcode.react';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

import { 
  getStudents, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getEnrollments,
  getPayments,
  getAttendance,
  createUser,
  updateUserProfile
} from '../../services/supabase/database';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';

function StudentManagement() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  const fileInputRef = useRef(null);
  
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [accountDialog, setAccountDialog] = useState(false);
  const [qrDialog, setQrDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: null,
    gender: '',
    address: '',
    phone: '',
    email: '',
    parent_name: '',
    parent_phone: '',
    parent_zalo: '',
    school: '',
    notes: ''
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const [accountData, setAccountData] = useState({
    username: '',
    password: '',
    role: 'student'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.phone && student.phone.includes(searchTerm))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  // Theo dõi thay đổi của selectedStudent để đảm bảo UI luôn được cập nhật
  useEffect(() => {
    if (selectedStudent) {
      console.log('🔄 Selected student changed, updating state...', selectedStudent.full_name);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await getStudents();
      if (error) throw error;
      
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification('Lỗi khi tải danh sách học sinh: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    setLoading(true);
    try {
      // Lấy danh sách lớp học đã đăng ký
      const { data: enrollmentData, error: enrollmentError } = await getEnrollments(null, studentId);
      if (enrollmentError) throw enrollmentError;
      
      setEnrollments(enrollmentData || []);
      
      // Lấy lịch sử thanh toán
      const { data: paymentData, error: paymentError } = await getPayments(studentId);
      if (paymentError) throw paymentError;
      
      setPayments(paymentData || []);
      
      // Lấy lịch sử điểm danh
      const { data: attendanceData, error: attendanceError } = await getAttendance(null, studentId);
      if (attendanceError) throw attendanceError;
      
      setAttendance(attendanceData || []);
      
    } catch (error) {
      console.error('Error fetching student details:', error);
      showNotification('Lỗi khi tải thông tin chi tiết học sinh: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedStudent = async (studentId) => {
    try {
      console.log('🔄 Refreshing selected student with ID:', studentId);
      
      // Fetch lại danh sách students mới nhất với đầy đủ thông tin join
      const { data: updatedStudentsData, error: studentsError } = await getStudents();
      if (studentsError) throw studentsError;
      
      if (updatedStudentsData) {
        const updatedStudent = updatedStudentsData.find(s => s.id === studentId);
        if (updatedStudent) {
          console.log('✅ Found refreshed student data:', updatedStudent);
          console.log('📊 Student structure:', JSON.stringify(updatedStudent, null, 2));
          
          // Cập nhật selectedStudent với dữ liệu mới
          setSelectedStudent(updatedStudent);
          
          // Cập nhật danh sách students và filteredStudents
          setStudents(updatedStudentsData);
          
          // Cập nhật filteredStudents dựa trên searchTerm hiện tại
          if (searchTerm.trim() === '') {
            setFilteredStudents(updatedStudentsData);
          } else {
            const filtered = updatedStudentsData.filter(student => 
              student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (student.phone && student.phone.includes(searchTerm))
            );
            setFilteredStudents(filtered);
          }
          
          // Force re-render bằng cách trigger state change
          console.log('🎯 UI should now reflect updated data for:', updatedStudent.full_name);
          
          return updatedStudent;
        } else {
          console.error('❌ Could not find updated student with ID:', studentId);
        }
      }
    } catch (error) {
      console.error('Error refreshing selected student:', error);
      showNotification('Lỗi khi làm mới thông tin học sinh: ' + error.message, 'error');
    }
    return null;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    fetchStudentDetails(student.id);
  };

  const handleOpenDialog = (student = null) => {
    console.log('🚪 handleOpenDialog called with:', student); // Debug entry point
    if (student) {
      // Flatten dữ liệu từ student và user_profiles
      // Handle case where user_profiles might be array or object
      let profile = {};
      if (student.user_profiles) {
        if (Array.isArray(student.user_profiles)) {
          profile = student.user_profiles[0] || {};
          console.log('📊 user_profiles is ARRAY, taking first element:', profile);
        } else {
          profile = student.user_profiles;
          console.log('📊 user_profiles is OBJECT:', profile);
        }
      }
      setIsEditMode(true);
      
      const formDataToSet = {
        // Thông tin từ bảng students
        user_id: student.user_id,
        parent_name: student.parent_name || '',
        parent_phone: student.parent_phone || '',
        parent_zalo: student.parent_zalo || '',
        school: student.school || '',
        notes: student.notes || '',
        gender: student.gender || '',
        // Thông tin từ bảng user_profiles
        full_name: profile.full_name || '',
        date_of_birth: student.date_of_birth ? dayjs(student.date_of_birth) : null,
        address: student.address || '',
        phone: profile.phone || '',
        email: profile.email || ''
      };
      
      console.log('📝 Form data to set:', formDataToSet); // Debug form data
      setFormData(formDataToSet);
    } else {
      console.log('🆕 Opening dialog for NEW student'); // Debug new mode
      setIsEditMode(false);
      setFormData({
        full_name: '',
        date_of_birth: null,
        gender: '',
        address: '',
        phone: '',
        email: '',
        parent_name: '',
        parent_phone: '',
        parent_zalo: '',
        school: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    console.log('🚪 Closing dialog, resetting states'); // Debug log
    setOpenDialog(false);
    setIsEditMode(false);
    // Reset form data để tránh carry-over
    setFormData({
      full_name: '',
      date_of_birth: null,
      gender: '',
      address: '',
      phone: '',
      email: '',
      parent_name: '',
      parent_phone: '',
      parent_zalo: '',
      school: '',
      notes: ''
    });
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const handleOpenQrDialog = () => {
    setQrDialog(true);
  };

  const handleCloseQrDialog = () => {
    setQrDialog(false);
  };

  const handleOpenImportDialog = () => {
    setImportData([]);
    setImportErrors([]);
    setImportDialog(true);
  };

  const handleCloseImportDialog = () => {
    setImportDialog(false);
  };

  const handleOpenAccountDialog = () => {
    if (!selectedStudent) return;
    
    // Tạo username dựa trên tên học sinh + 4 số ngẫu nhiên
    const nameOnly = selectedStudent.full_name.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();
    
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const username = `${nameOnly}${randomNum}`;
    
    // Tạo mật khẩu ngẫu nhiên 6 số
    const password = Math.floor(100000 + Math.random() * 900000).toString();
    
    setAccountData({
      username: username,
      password: password,
      role: 'student'
    });
    
    setAccountDialog(true);
  };

  const handleCloseAccountDialog = () => {
    setAccountDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (value) => {
    setFormData({
      ...formData,
      date_of_birth: value
    });
  };

  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setAccountData({
      ...accountData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    if (!formData.full_name) {
      showNotification('Vui lòng nhập họ tên học sinh', 'error');
      return;
    }   
    setLoading(true);
    try {
      // Tách dữ liệu cho bảng students
      console.log('📝 Preparing student data for submission:', formData);
      const studentData = {
        user_id: formData.user_id,
        parent_name: formData.parent_name || null,
        parent_phone: formData.parent_phone || null,
        gender:formData.gender??'Nam',
        parent_zalo: formData.parent_zalo || null,
        school: formData.school || null,
        notes: formData.notes || null
      };

      // Tách dữ liệu cho bảng user_profiles  
      const profileData = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        email: formData.email && formData.email.trim() !== '' ? formData.email : null, // null thay vì chuỗi rỗng
      };
      
      let result;
      // Kiểm tra cẩn thận điều kiện edit mode
      const isActuallyEditMode = isEditMode && (formData.user_id || selectedStudent?.user_id);

      if (isActuallyEditMode) {
        // Cập nhật học sinh - cập nhật cả students và user_profiles
        const studentIdToUpdate = formData.user_id || selectedStudent.user_id;
        
        result = await updateStudent(studentIdToUpdate, studentData);
        if (result.error) {
          console.error('❌ Error updating student:', result.error);
          throw result.error;
        }
        // Cập nhật user_profiles (chỉ khi có user_id)
        if (formData.user_id) {
          const profileResult = await updateUserProfile(formData.user_id, profileData);
          if (profileResult.error) {
            console.error('❌ Error updating profile:', profileResult.error);
            throw profileResult.error;
          }
        }
        
        console.log('✅ Student and profile updated successfully');
        
        // Cập nhật selectedStudent ngay lập tức với dữ liệu mới
        const updatedSelectedStudent = {
          ...selectedStudent,
          // Cập nhật thông tin từ students table
          parent_name: formData.parent_name,
          parent_phone: formData.parent_phone,
          gender: formData.gender,
          parent_zalo: formData.parent_zalo,
          school: formData.school,
          notes: formData.notes,
          date_of_birth: formData.date_of_birth ? formData.date_of_birth.format('YYYY-MM-DD') : selectedStudent.date_of_birth,
          address: formData.address,
          // Cập nhật thông tin từ user_profiles
          full_name: profileData.full_name,
          phone: profileData.phone,
          email: profileData.email,
          // Nếu có user_profiles object, cập nhật nó cũng
          user_profiles: selectedStudent.user_profiles ? {
            ...selectedStudent.user_profiles,
            full_name: profileData.full_name,
            phone: profileData.phone,
            email: profileData.email
          } : null
        };
        
        console.log('🔄 Updating selectedStudent immediately:', updatedSelectedStudent);
        setSelectedStudent(updatedSelectedStudent);
        
        // Cập nhật danh sách students
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.id === selectedStudent.id ? updatedSelectedStudent : student
          )
        );
        
        // Cập nhật filteredStudents
        setFilteredStudents(prevFiltered => 
          prevFiltered.map(student => 
            student.id === selectedStudent.id ? updatedSelectedStudent : student
          )
        );
        
      } else {
        // Tạo học sinh mới
        console.log('🆕 CREATE MODE');
        const combinedData = { ...studentData, ...profileData };
        console.log('📝 Combined data to create:', combinedData);
        result = await createStudent(combinedData);
      }
      
      if (result.error) throw result.error;
      
      showNotification(
        isActuallyEditMode ? 'Cập nhật thông tin học sinh thành công' : 'Thêm học sinh mới thành công',
        'success'
      );
      
      handleCloseDialog();
      
      // Chỉ refresh từ database cho trường hợp tạo mới
      if (!isActuallyEditMode) {
        await fetchStudents();
      }
      
    } catch (error) {
      console.error('Error saving student:', error);
      showNotification('Lỗi khi lưu thông tin học sinh: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      const { error } = await deleteStudent(selectedStudent.id);
      if (error) throw error;
      
      showNotification('Xóa học sinh thành công', 'success');
      setSelectedStudent(null);
      handleCloseDeleteDialog();
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      showNotification('Lỗi khi xóa học sinh: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      // Tạo thông tin email từ username
      const email = `${accountData.username}@example.com`;
      
      // Tạo người dùng mới
      const { data, error } = await createUser({
        email: email,
        password: accountData.password,
        user_metadata: {
          full_name: selectedStudent.full_name,
          role: accountData.role
        },
        student_id: selectedStudent.id
      });
      
      if (error) throw error;
      
      showNotification('Tạo tài khoản thành công', 'success');
      showNotification(`Tài khoản: ${accountData.username} / Mật khẩu: ${accountData.password}`, 'info');
      handleCloseAccountDialog();
      
      // Cập nhật thông tin học sinh
      const updatedStudent = {
        ...selectedStudent,
        user_id: data.id
      };
      
      setSelectedStudent(updatedStudent);
      
      // Cập nhật danh sách học sinh
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === selectedStudent.id ? updatedStudent : student
        )
      );
      
      // Cập nhật danh sách lọc
      setFilteredStudents(prevFiltered => 
        prevFiltered.map(student => 
          student.id === selectedStudent.id ? updatedStudent : student
        )
      );
      
    } catch (error) {
      console.error('Error creating account:', error);
      showNotification('Lỗi khi tạo tài khoản: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dat = new Uint8Array(e.target.result);
        const workbook = XLSX.read(dat, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (jsonData.length < 2) {
          showNotification('File không có dữ liệu hoặc không đúng định dạng', 'error');
          return;
        }
        
        // Xác thực header
        const headers = jsonData[0];
        const requiredHeaders = ['Họ và tên', 'Ngày sinh', 'Giới tính', 'Địa chỉ', 'Điện thoại', 'Email', 'Phụ huynh', 'SĐT phụ huynh', 'Zalo phụ huynh', 'Trường', 'Lớp'];
        
        // Kiểm tra xem tất cả các cột cần thiết có tồn tại không
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          showNotification(`File thiếu các cột: ${missingHeaders.join(', ')}`, 'error');
          return;
        }
        
        // Đọc và xác thực dữ liệu
        const data = [];
        const errors = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length === 0 || !row[0]) continue; // Bỏ qua dòng trống
          
          // Lưu các index của các cột để tránh tính toán lại nhiều lần
          const nameIndex = headers.indexOf('Họ và tên');
          const dobIndex = headers.indexOf('Ngày sinh');
          const genderIndex = headers.indexOf('Giới tính');
          const addressIndex = headers.indexOf('Địa chỉ');
          const phoneIndex = headers.indexOf('Điện thoại');
          const emailIndex = headers.indexOf('Email');
          const parentNameIndex = headers.indexOf('Phụ huynh');
          const parentPhoneIndex = headers.indexOf('SĐT phụ huynh');
          const parentZaloIndex = headers.indexOf('Zalo phụ huynh');
          const schoolIndex = headers.indexOf('Trường');
          const gradeIndex = headers.indexOf('Lớp');
          const notesIndex = headers.indexOf('Ghi chú');
          
          const student = {
            full_name: nameIndex >= 0 ? row[nameIndex] || '' : '',
            date_of_birth: dobIndex >= 0 ? row[dobIndex] || null : null,
            gender: genderIndex >= 0 ? row[genderIndex] || '' : '',
            address: addressIndex >= 0 ? row[addressIndex] || '' : '',
            phone: phoneIndex >= 0 ? row[phoneIndex] || '' : '',
            email: emailIndex >= 0 ? row[emailIndex] || '' : '',
            parent_name: parentNameIndex >= 0 ? row[parentNameIndex] || '' : '',
            parent_phone: parentPhoneIndex >= 0 ? row[parentPhoneIndex] || '' : '',
            parent_zalo: parentZaloIndex >= 0 ? row[parentZaloIndex] || '' : '',
            school: schoolIndex >= 0 ? row[schoolIndex] || '' : '',
            grade: gradeIndex >= 0 ? row[gradeIndex] || '' : '',
            notes: notesIndex >= 0 ? row[notesIndex] || '' : '',
          };
          
          // Xác thực trường bắt buộc
          if (!student.full_name) {
            errors.push(`Dòng ${i + 1}: Thiếu họ tên học sinh`);
            continue;
          }
          
          // Chuyển đổi định dạng ngày tháng nếu có - ƯU TIÊN FORMAT DD-MM-YYYY
          if (student.date_of_birth) {
            try {
              if (typeof student.date_of_birth === 'string') {
                // Nếu là chuỗi, thử phân tích cú pháp - ƯU TIÊN DD-MM-YYYY
                const formats = ['DD-MM-YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'YYYY/MM/DD'];
                let validDate = null;
                
                for (const format of formats) {
                  const date = dayjs(student.date_of_birth, format, true); // strict parsing
                  if (date.isValid()) {
                    validDate = date;
                    break;
                  }
                }
                
                if (validDate) {
                  student.date_of_birth = validDate.format('YYYY-MM-DD'); // Lưu vào DB theo format ISO
                } else {
                  student.date_of_birth = null;
                  errors.push(`Dòng ${i + 1}: Ngày sinh không hợp lệ (định dạng cần: DD-MM-YYYY)`);
                }
              } else if (typeof student.date_of_birth === 'number') {
                // Nếu là số, có thể là serial date của Excel
                const excelEpoch = new Date(1900, 0, 0);
                const days = student.date_of_birth - 1; // Trừ 1 vì Excel tính từ 1/1/1900 là ngày 1
                excelEpoch.setDate(excelEpoch.getDate() + days);
                student.date_of_birth = dayjs(excelEpoch).format('YYYY-MM-DD');
              }
            } catch (error) {
              student.date_of_birth = null;
              errors.push(`Dòng ${i + 1}: Lỗi xử lý ngày sinh`);
            }
          }
          
          data.push(student);
        }
        
        setImportData(data);
        setImportErrors(errors);
        
        if (errors.length > 0) {
          showNotification(`Có ${errors.length} lỗi trong file. Vui lòng kiểm tra chi tiết.`, 'warning');
        } else {
          showNotification(`Đã đọc ${data.length} học sinh từ file`, 'success');
        }
        
      } catch (error) {
        console.error('Error reading Excel file:', error);
        showNotification('Lỗi khi đọc file Excel: ' + error.message, 'error');
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset input để có thể tải cùng một file nhiều lần
    event.target.value = null;
  };

  const handleImportStudents = async () => {
    if (importData.length === 0) {
      showNotification('Không có dữ liệu để nhập', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Nhập từng học sinh một
      const results = [];
      for (const student of importData) {
        const { data, error } = await createStudent(student);
        if (error) {
          console.error('Error importing student:', error);
          results.push({ success: false, name: student.full_name, error: error.message });
        } else {
          results.push({ success: true, name: student.full_name, data });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;
      
      if (errorCount === 0) {
        showNotification(`Nhập thành công ${successCount} học sinh`, 'success');
      } else {
        showNotification(`Nhập ${successCount} học sinh thành công, ${errorCount} học sinh thất bại`, 'warning');
      }
      
      handleCloseImportDialog();
      fetchStudents();
      
    } catch (error) {
      console.error('Error batch importing students:', error);
      showNotification('Lỗi khi nhập danh sách học sinh: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTemplate = () => {
    try {
      // Tạo workbook mới với một worksheet
      const wb = XLSX.utils.book_new();
      
      // Tạo header cho template
      const headers = ['Họ và tên', 'Ngày sinh', 'Giới tính', 'Địa chỉ', 'Điện thoại', 'Email', 'Phụ huynh', 'SĐT phụ huynh', 'Zalo phụ huynh', 'Trường', 'Lớp'];
      
      // Tạo một mảng dữ liệu với header
      const data = [
        headers
      ];
      
      // Tạo worksheet từ dữ liệu
      const ws = XLSX.utils.aoa_to_sheet(data);
      
      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      
      // Xuất file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      FileSaver.saveAs(blob, 'hoc_sinh_template.xlsx');
      
      showNotification('Đã tải xuống file mẫu', 'success');
    } catch (error) {
      console.error('Error exporting template:', error);
      showNotification('Lỗi khi xuất file mẫu: ' + error.message, 'error');
    }
  };

  const handleExportStudents = () => {
    try {
      // Tạo workbook mới với một worksheet
      const wb = XLSX.utils.book_new();
      
      // Tạo header
      const headers = ['Họ và tên', 'Ngày sinh', 'Giới tính', 'Địa chỉ', 'Điện thoại', 'Email', 'Phụ huynh', 'SĐT phụ huynh', 'Zalo phụ huynh', 'Trường', 'Lớp', 'Ghi chú'];
      
      // Chuẩn bị dữ liệu xuất
      const data = [headers];
      
      students.forEach(student => {
        const row = [
          student.full_name,
          student.date_of_birth ? dayjs(student.date_of_birth).format('DD-MM-YYYY') : '',
          student.gender || '',
          student.address || '',
          student.phone || '',
          student.email || '',
          student.parent_name || '',
          student.parent_phone || '',
          student.parent_zalo || '',
          student.school || '',
          student.grade || '',
          student.notes || ''
        ];
        
        data.push(row);
      });
      
      // Tạo worksheet từ dữ liệu
      const ws = XLSX.utils.aoa_to_sheet(data);
      
      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Học sinh');
      
      // Xuất file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      FileSaver.saveAs(blob, `danh_sach_hoc_sinh_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showNotification('Đã xuất danh sách học sinh', 'success');
    } catch (error) {
      console.error('Error exporting students:', error);
      showNotification('Lỗi khi xuất danh sách học sinh: ' + error.message, 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showNotification('Đã sao chép vào clipboard', 'success');
      })
      .catch(err => {
        console.error('Lỗi khi sao chép:', err);
        showNotification('Lỗi khi sao chép vào clipboard', 'error');
      });
  };

  return (
    <Box>
      <PageHeader 
        title="Quản lý học sinh" 
        breadcrumbs={[
          { label: 'Trang chủ', link: '/admin' },
          { label: 'Quản lý học sinh' }
        ]} 
      />
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          placeholder="Tìm kiếm học sinh..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: '500px', border: '1px solid white', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportTemplate}
            sx={{ borderColor: 'white',color: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Tải file mẫu
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={handleOpenImportDialog}
              sx={{ borderColor: 'white',color: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Nhập từ Excel
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportStudents}
              sx={{ borderColor: 'white',color: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Xuất Excel
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm học sinh
          </Button>
        </Box>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload} 
        />
      </Box>
      
      <Grid container spacing={3}>
        {/* Danh sách học sinh */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Danh sách học sinh ({filteredStudents.length})
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <Card 
                    key={student.id} 
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      backgroundColor: selectedStudent?.id === student.id ? 'primary.light' : 'background.paper',
                      color: selectedStudent?.id === student.id ? 'primary.contrastText' : 'text.primary',
                    }}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar sx={{ mr: 2, bgcolor: selectedStudent?.id === student.id ? 'primary.dark' : 'primary.main' }}>
                          {student.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h6">{student.full_name}</Typography>
                      </Box>
                      
                      {student.phone && (
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">{student.phone}</Typography>
                        </Box>
                      )}
                      
                      {student.email && (
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">{student.email}</Typography>
                        </Box>
                      )}
                      
                      {student.school && (
                        <Box display="flex" alignItems="center">
                          <SchoolIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">
                            {student.school}{student.grade ? ` - ${student.grade}` : ''}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" py={4}>
                  {searchTerm ? 'Không tìm thấy học sinh nào' : 'Chưa có học sinh nào. Thêm học sinh mới để bắt đầu.'}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Chi tiết học sinh */}
        <Grid item xs={12} md={7} lg={8}>
          {selectedStudent ? (
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{selectedStudent.full_name}</Typography>
                <Box>
                  <IconButton 
                    color="info" 
                    onClick={handleOpenQrDialog}
                    sx={{ mr: 1 }}
                    title="Xem mã QR"
                  >
                    <QrCodeIcon />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    onClick={() => {
                      handleOpenDialog(selectedStudent);
                    }}
                    sx={{ mr: 1 }}
                    title="Sửa thông tin"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={handleOpenDeleteDialog}
                    title="Xóa học sinh"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  {selectedStudent.user_id && (
                    <Chip 
                      icon={<QrCodeIcon />} 
                      label={`Mã điểm danh: ${selectedStudent.user_id}`} 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mr: 1 }}
                    />
                  )}
                  {selectedStudent.user_id && (
                    <Chip 
                      icon={<PersonIcon />} 
                      label="Có tài khoản" 
                      color="success" 
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {!selectedStudent.user_id && (
                  <Button
                    variant="outlined"
                    onClick={handleOpenAccountDialog}
                    startIcon={<PersonIcon />}
                  >
                    Tạo tài khoản
                  </Button>
                )}
              </Box>
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Thông tin cá nhân" />
                  <Tab label="Lớp học" />
                  <Tab label="Thanh toán" />
                  <Tab label="Điểm danh" />
                </Tabs>
              </Box>
              
              {/* Tab thông tin cá nhân */}
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Ngày sinh</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedStudent.date_of_birth ? dayjs(selectedStudent.date_of_birth).format('DD-MM-YYYY') : 'Chưa cập nhật'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Giới tính</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedStudent.gender || 'Chưa cập nhật'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Địa chỉ</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedStudent.address || 'Chưa cập nhật'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Số điện thoại</Typography>
                    <Typography variant="body1" paragraph>
                      {(() => {
                        // Lấy phone từ user_profiles nếu có, nếu không thì từ selectedStudent
                        let phone = selectedStudent.phone;
                        if (selectedStudent.user_profiles) {
                          if (Array.isArray(selectedStudent.user_profiles)) {
                            phone = selectedStudent.user_profiles[0]?.phone || selectedStudent.phone;
                          } else {
                            phone = selectedStudent.user_profiles.phone || selectedStudent.phone;
                          }
                        }
                        return phone || 'Chưa cập nhật';
                      })()}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Email</Typography>
                    <Typography variant="body1" paragraph>
                      {(() => {
                        // Lấy email từ user_profiles nếu có, nếu không thì từ selectedStudent
                        let email = selectedStudent.email;
                        if (selectedStudent.user_profiles) {
                          if (Array.isArray(selectedStudent.user_profiles)) {
                            email = selectedStudent.user_profiles[0]?.email || selectedStudent.email;
                          } else {
                            email = selectedStudent.user_profiles.email || selectedStudent.email;
                          }
                        }
                        return email || 'Chưa cập nhật';
                      })()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Phụ huynh</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedStudent.parent_name || 'Chưa cập nhật'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Số điện thoại phụ huynh</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedStudent.parent_phone || 'Chưa cập nhật'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Zalo phụ huynh</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedStudent.parent_zalo || 'Chưa cập nhật'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Trường</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedStudent.school || 'Chưa cập nhật'}
                    </Typography>
                    
                  </Grid>
                  
                  {selectedStudent.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Ghi chú</Typography>
                      <Typography variant="body1" paragraph>
                        {selectedStudent.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
              
              {/* Tab lớp học */}
              {tabValue === 1 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Lớp học đã đăng ký ({enrollments.length})
                  </Typography>
                  
                  {enrollments.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Lớp học</TableCell>
                            <TableCell>Môn học</TableCell>
                            <TableCell>Ngày đăng ký</TableCell>
                            <TableCell>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {enrollments.map((enrollment) => (
                            <TableRow key={enrollment.id}>
                              <TableCell>{enrollment.classes?.name || 'N/A'}</TableCell>
                              <TableCell>{enrollment.classes?.subject || 'N/A'}</TableCell>
                              <TableCell>
                                {dayjs(enrollment.enrolled_at).format('DD-MM-YYYY')}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={enrollment.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                                  color={enrollment.status === 'active' ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                      Học sinh chưa đăng ký lớp học nào
                    </Typography>
                  )}
                </>
              )}
              
              {/* Tab thanh toán */}
              {tabValue === 2 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Lịch sử thanh toán ({payments.length})
                  </Typography>
                  
                  {payments.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Lớp học</TableCell>
                            <TableCell>Số tiền</TableCell>
                            <TableCell>Ngày thanh toán</TableCell>
                            <TableCell>Phương thức</TableCell>
                            <TableCell>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.classes?.name || 'N/A'}</TableCell>
                              <TableCell>{payment.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                              <TableCell>
                                {dayjs(payment.payment_date).format('DD-MM-YYYY')}
                              </TableCell>
                              <TableCell>
                                {payment.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={
                                    payment.status === 'completed' ? 'Đã thanh toán' : 
                                    payment.status === 'pending' ? 'Đang xử lý' : 'Đã hủy'
                                  }
                                  color={
                                    payment.status === 'completed' ? 'success' : 
                                    payment.status === 'pending' ? 'warning' : 'error'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                      Chưa có lịch sử thanh toán
                    </Typography>
                  )}
                </>
              )}
              
              {/* Tab điểm danh */}
              {tabValue === 3 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Lịch sử điểm danh ({attendance.length})
                  </Typography>
                  
                  {attendance.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Lớp học</TableCell>
                            <TableCell>Ngày</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Ghi chú</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {attendance.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{record.classes?.name || 'N/A'}</TableCell>
                              <TableCell>
                                {dayjs(record.date).format('DD-MM-YYYY')}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={record.status ? 'Có mặt' : 'Vắng mặt'}
                                  color={record.status ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{record.notes || ''}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                      Chưa có lịch sử điểm danh
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Chọn một học sinh để xem chi tiết
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hoặc thêm học sinh mới bằng nút "Thêm học sinh" ở trên
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Dialog thêm/sửa học sinh */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Cập nhật thông tin học sinh' : 'Thêm học sinh mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="full_name"
                label="Họ và tên"
                fullWidth
                value={formData.full_name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Ngày sinh"
                value={formData.date_of_birth}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Giới tính</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  label="Giới tính"
                >
                  <MenuItem value="Nam">Nam</MenuItem>
                  <MenuItem value="Nữ">Nữ</MenuItem>
                  <MenuItem value="Khác">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Số điện thoại"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="address"
                label="Địa chỉ"
                fullWidth
                value={formData.address}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="school"
                label="Trường"
                fullWidth
                value={formData.school}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="parent_name"
                label="Họ tên phụ huynh"
                fullWidth
                value={formData.parent_name}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="parent_phone"
                label="Số điện thoại phụ huynh"
                fullWidth
                value={formData.parent_phone}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="parent_zalo"
                label="Zalo phụ huynh"
                fullWidth
                value={formData.parent_zalo}
                onChange={handleInputChange}
                margin="normal"
                helperText="Số điện thoại Zalo để gửi thông báo"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Ghi chú"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa học sinh</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa học sinh "{selectedStudent?.full_name}"? 
            Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteStudent} color="error" variant="contained">
            Xóa học sinh
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog hiển thị mã QR điểm danh */}
      <Dialog open={qrDialog} onClose={handleCloseQrDialog}>
        <DialogTitle>Mã QR điểm danh của học sinh</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" my={2}>
            {selectedStudent?.user_id ? (
              <>
                <QRCode 
                  value={selectedStudent.user_id} 
                  size={200}
                  level="H"
                  includeMargin
                />
                <Typography variant="subtitle1" mt={2}>
                  {selectedStudent.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Mã điểm danh: {selectedStudent.user_id}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const canvas = document.querySelector("canvas");
                    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                    let downloadLink = document.createElement("a");
                    downloadLink.href = pngUrl;
                    downloadLink.download = `QR_${selectedStudent.user_id}_${selectedStudent.full_name.replace(/\s+/g, '_')}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                  }}
                  sx={{ mt: 2 }}
                >
                  Tải xuống mã QR
                </Button>
              </>
            ) : (
              <Typography variant="body1" color="error">
                Học sinh chưa có tài khoản. Vui lòng tạo tài khoản trước để tạo mã điểm danh.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog nhập từ Excel */}
      <Dialog open={importDialog} onClose={handleCloseImportDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nhập danh sách học sinh từ Excel</DialogTitle>
        <DialogContent dividers>
          <Box mb={3}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Chọn file Excel
            </Button>
          </Box>
          
          {importErrors.length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle1" color="error" gutterBottom>
                Lỗi khi đọc file:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#fff8e1' }}>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {importErrors.map((error, index) => (
                    <li key={index}>
                      <Typography variant="body2" color="error">
                        {error}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Paper>
            </Box>
          )}
          
          {importData.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Dữ liệu để nhập ({importData.length} học sinh):
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: '300px' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Họ và tên</TableCell>
                      <TableCell>Ngày sinh</TableCell>
                      <TableCell>Giới tính</TableCell>
                      <TableCell>SĐT</TableCell>
                      <TableCell>Phụ huynh</TableCell>
                      <TableCell>SĐT phụ huynh</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importData.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.date_of_birth}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell>{student.parent_name}</TableCell>
                        <TableCell>{student.parent_phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>Hủy</Button>
          <Button 
            onClick={handleImportStudents} 
            variant="contained" 
            color="primary"
            disabled={importData.length === 0}
          >
            Nhập dữ liệu
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog tạo tài khoản */}
      <Dialog open={accountDialog} onClose={handleCloseAccountDialog}>
        <DialogTitle>Tạo tài khoản cho học sinh</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tạo tài khoản cho học sinh "{selectedStudent?.full_name}". 
            Học sinh sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
          </DialogContentText>
          
          <Box mt={2}>
            <TextField
              label="Tên đăng nhập"
              name="username"
              value={accountData.username}
              onChange={handleAccountInputChange}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Sao chép">
                      <IconButton onClick={() => copyToClipboard(accountData.username)}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Mật khẩu"
              name="password"
              value={accountData.password}
              onChange={handleAccountInputChange}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Sao chép">
                      <IconButton onClick={() => copyToClipboard(accountData.password)}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAccountDialog}>Hủy</Button>
          <Button onClick={handleCreateAccount} variant="contained" color="primary">
            Tạo tài khoản
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StudentManagement;
