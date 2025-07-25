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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Chip,
  Alert,
  Tooltip,
  CircularProgress,
  Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import dayjs from 'dayjs';
import { Html5QrcodeScanner } from 'html5-qrcode';

import {
  getClasses,
  getClassEnrollments,
  getAttendanceByDate,
  markAttendance,
  updateAttendance,
  getStudentByQrCode,
  sendZaloNotification
} from '../../services/supabase/database';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';

function Attendance() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  const qrScannerRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [scannerDialog, setScannerDialog] = useState(false);
  const [scannedStudentId, setScannedStudentId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [notificationType, setNotificationType] = useState('absence');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [absentStudents, setAbsentStudents] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    // Cleanup QR scanner when component unmounts
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await getClasses();
      if (error) throw error;
      
      // Xử lý khi không có dữ liệu hoặc lớp không hoạt động
      const activeClasses = (data || []).filter(c => c.is_active);
      setClasses(activeClasses);
      
      // Chọn lớp đầu tiên nếu có, ngược lại set null
      setSelectedClass(activeClasses.length > 0 ? activeClasses[0] : null);
      
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Chỉ hiển thị lỗi nếu có vấn đề kết nối/server
      if (!error.message.includes('No classes found')) {
        showNotification('Lỗi khi tải danh sách lớp học: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    // Không gọi API nếu không có lớp được chọn
    if (!selectedClass?.id) {
      setStudents([]);
      setAttendanceRecords([]);
      setAbsentStudents([]);
      return;
    }

    setLoading(true);
    try {
      // Lấy danh sách học sinh trong lớp
      const { data: enrollmentData, error: enrollmentError } = await getClassEnrollments(selectedClass.id);
      if (enrollmentError) throw enrollmentError;
      
      // Xử lý khi không có học sinh nào
      const studentsInClass = enrollmentData?.map(enrollment => enrollment.students) || [];
      setStudents(studentsInClass);
      
      // Lấy dữ liệu điểm danh
      const { data: attendanceData, error: attendanceError } = await getAttendanceByDate(
        selectedClass.id, 
        selectedDate.format('YYYY-MM-DD')
      );
      if (attendanceError) throw attendanceError;
      
      // Tạo bản ghi điểm danh mặc định nếu không có dữ liệu
      const attendanceMap = (attendanceData || []).reduce((acc, record) => {
        acc[record.student_id] = record;
        return acc;
      }, {});
      
      const records = studentsInClass.map(student => ({
        student_id: student.id,
        student_name: student.full_name,
        student: student,
        attendance_id: attendanceMap[student.id]?.id || null,
        present: attendanceMap[student.id]?.status ?? null,
        notes: attendanceMap[student.id]?.notes || '',
        saved: !!attendanceMap[student.id]
      }));
      
      setAttendanceRecords(records);
      setAbsentStudents(records.filter(record => record.present === false));
      
    } catch (error) {
      console.error('Error fetching attendance:', error);
      // Không hiển thị lỗi nếu chỉ là không có dữ liệu
      if (!error.message.includes('No attendance records') && 
          !error.message.includes('No students found')) {
        showNotification('Lỗi khi tải dữ liệu điểm danh: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    const selectedClass = classes.find(c => c.id === classId);
    setSelectedClass(selectedClass);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTogglePresent = (studentId) => {
    setAttendanceRecords(prev => {
      const updated = prev.map(record => {
        if (record.student_id === studentId) {
          return {
            ...record,
            present: record.present === null ? true : (record.present === true ? false : true),
            saved: false
          };
        }
        return record;
      });
      setHasChanges(true);
      return updated;
    });
  };

  const handleNotesChange = (studentId, notes) => {
    setAttendanceRecords(prev => {
      const updated = prev.map(record => {
        if (record.student_id === studentId) {
          return {
            ...record,
            notes,
            saved: false
          };
        }
        return record;
      });
      setHasChanges(true);
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    try {
      // Lọc ra các bản ghi chưa được lưu hoặc đã thay đổi
      const unsavedRecords = attendanceRecords.filter(record => 
        record.present !== null && !record.saved
      );
      
      if (unsavedRecords.length === 0) {
        showNotification('Không có thay đổi để lưu', 'info');
        return;
      }
      
      // Lưu từng bản ghi
      const savePromises = unsavedRecords.map(async record => {
        const attendanceData = {
          student_id: record.student_id,
          class_id: selectedClass.id,
          date: selectedDate.format('YYYY-MM-DD'),
          status: record.present,
          notes: record.notes
        };
        
        if (record.attendance_id) {
          // Cập nhật bản ghi hiện có
          return updateAttendance(record.attendance_id, attendanceData);
        } else {
          // Tạo bản ghi mới
          return markAttendance(attendanceData);
        }
      });
      
      const results = await Promise.all(savePromises);
      
      // Kiểm tra lỗi
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Có ${errors.length} lỗi khi lưu điểm danh`);
      }
      
      showNotification('Lưu điểm danh thành công', 'success');
      
      // Cập nhật lại danh sách điểm danh
      fetchAttendance();
      setHasChanges(false);
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      showNotification('Lỗi khi lưu điểm danh: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQrScanner = () => {
    setScannerDialog(true);
    setScannedStudentId(null);
    setScanning(true);
    
    // Khởi tạo QR scanner sau khi dialog hiển thị
    setTimeout(() => {
      if (qrScannerRef.current) {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: 250 },
          /* verbose= */ false
        );
        
        html5QrcodeScanner.render((decodedText) => {
          // Xử lý khi quét thành công
          processQrCode(decodedText);
        }, (error) => {
          // Bỏ qua lỗi để scanner tiếp tục hoạt động
        });
        
        setScanner(html5QrcodeScanner);
      }
    }, 500);
  };

  const handleCloseQrScanner = () => {
    if (scanner) {
      scanner.clear();
    }
    setScannerDialog(false);
    setScanning(false);
  };

  const processQrCode = async (qrCode) => {
    setScanning(false);
    
    try {
      // Tìm học sinh với mã QR
      const { data: student, error } = await getStudentByQrCode(qrCode);
      
      if (error) throw error;
      
      if (!student) {
        showNotification('Không tìm thấy học sinh với mã QR này', 'error');
        setScanning(true);
        return;
      }
      
      // Kiểm tra xem học sinh có trong lớp này không
      const studentInClass = students.find(s => s.id === student.id);
      if (!studentInClass) {
        showNotification('Học sinh này không thuộc lớp đang điểm danh', 'warning');
        setScanning(true);
        return;
      }
      
      // Tìm bản ghi điểm danh tương ứng
      const attendanceRecord = attendanceRecords.find(record => record.student_id === student.id);
      
      if (!attendanceRecord) {
        showNotification('Không tìm thấy dữ liệu điểm danh cho học sinh này', 'error');
        setScanning(true);
        return;
      }
      
      // Cập nhật trạng thái điểm danh
      setAttendanceRecords(prev => {
        const updated = prev.map(record => {
          if (record.student_id === student.id) {
            return {
              ...record,
              present: true,
              saved: false
            };
          }
          return record;
        });
        return updated;
      });
      
      setScannedStudentId(student.id);
      setHasChanges(true);
      
      // Hiển thị thông báo
      showNotification(`Điểm danh thành công: ${student.full_name}`, 'success');
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      showNotification('Lỗi khi xử lý mã QR: ' + error.message, 'error');
    }
  };

  const handleMarkAllPresent = () => {
    setAttendanceRecords(prev => {
      return prev.map(record => ({
        ...record,
        present: true,
        saved: false
      }));
    });
    setHasChanges(true);
  };

  const handleOpenNotificationDialog = () => {
    // Lấy danh sách học sinh vắng mặt
    const absent = attendanceRecords.filter(record => record.present === false);
    setAbsentStudents(absent);
    
    if (absent.length === 0) {
      showNotification('Không có học sinh vắng mặt để gửi thông báo', 'info');
      return;
    }
    
    // Mặc định chọn tất cả học sinh vắng mặt
    setSelectedStudents(absent.map(record => record.student_id));
    
    // Đặt mặc định cho tin nhắn
    const defaultMessage = `Thông báo: Học sinh [tên học sinh] đã vắng mặt tại lớp ${selectedClass.name} ngày ${selectedDate.format('DD/MM/YYYY')}.`;
    setNotificationMessage(defaultMessage);
    
    setNotificationDialog(true);
  };

  const handleCloseNotificationDialog = () => {
    setNotificationDialog(false);
  };

  const handleSelectAllStudents = (event) => {
    if (event.target.checked) {
      setSelectedStudents(absentStudents.map(student => student.student_id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleNotificationTypeChange = (event) => {
    const type = event.target.value;
    setNotificationType(type);
    
    // Cập nhật mẫu tin nhắn dựa trên loại
    let template = '';
    switch (type) {
      case 'absence':
        template = `Thông báo: Học sinh [tên học sinh] đã vắng mặt tại lớp ${selectedClass.name} ngày ${selectedDate.format('DD/MM/YYYY')}.`;
        break;
      case 'payment':
        template = `Thông báo: Học sinh [tên học sinh] cần đóng học phí cho lớp ${selectedClass.name}. Vui lòng thanh toán trước ngày [ngày].`;
        break;
      case 'exam':
        template = `Thông báo: Học sinh [tên học sinh] có kết quả kiểm tra lớp ${selectedClass.name} như sau: [điểm].`;
        break;
      default:
        template = '';
    }
    
    setNotificationMessage(template);
  };

  const handleSendNotifications = async () => {
    if (selectedStudents.length === 0) {
      showNotification('Vui lòng chọn ít nhất một học sinh', 'warning');
      return;
    }
    
    if (!notificationMessage.trim()) {
      showNotification('Vui lòng nhập nội dung thông báo', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      // Gửi thông báo cho từng học sinh đã chọn
      const sendPromises = selectedStudents.map(async studentId => {
        const student = absentStudents.find(s => s.student_id === studentId)?.student;
        
        if (!student) return { error: new Error('Không tìm thấy học sinh') };
        
        // Thay thế placeholder trong tin nhắn
        let personalizedMessage = notificationMessage
          .replace('[tên học sinh]', student.full_name)
          .replace('[ngày]', dayjs().add(7, 'day').format('DD/MM/YYYY'));
        
        return sendZaloNotification(
          studentId,
          notificationType,
          personalizedMessage
        );
      });
      
      const results = await Promise.all(sendPromises);
      
      // Kiểm tra kết quả
      const successCount = results.filter(result => !result.error).length;
      const errorCount = results.length - successCount;
      
      if (errorCount === 0) {
        showNotification(`Đã gửi ${successCount} thông báo thành công`, 'success');
      } else {
        showNotification(`Đã gửi ${successCount} thông báo thành công, ${errorCount} thông báo thất bại`, 'warning');
      }
      
      handleCloseNotificationDialog();
      
    } catch (error) {
      console.error('Error sending notifications:', error);
      showNotification('Lỗi khi gửi thông báo: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader 
        title="Điểm danh" 
        breadcrumbs={[
          { label: 'Trang chủ', link: '/admin' },
          { label: 'Điểm danh' }
        ]} 
      />
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Lớp học</InputLabel>
              <Select
                value={selectedClass?.id || ''}
                onChange={handleClassChange}
                label="Lớp học"
              >
                {classes.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Ngày điểm danh"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<QrCodeScannerIcon />}
                onClick={handleOpenQrScanner}
                disabled={!selectedClass}
                fullWidth
              >
                Quét mã QR
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveAttendance}
                disabled={!hasChanges}
                fullWidth
              >
                Lưu điểm danh
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {selectedClass && attendanceRecords.length > 0 && (
          <Box mt={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Danh sách điểm danh ({attendanceRecords.length} học sinh)
              </Typography>
              
              <Box display="flex" gap={1}>
                <Button 
                  variant="outlined" 
                  onClick={handleMarkAllPresent}
                >
                  Điểm danh tất cả
                </Button>
                
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<NotificationsIcon />}
                  onClick={handleOpenNotificationDialog}
                  disabled={absentStudents.length === 0}
                >
                  Gửi thông báo vắng
                </Button>
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Học sinh</TableCell>
                    <TableCell align="center">Có mặt</TableCell>
                    <TableCell align="center">Vắng mặt</TableCell>
                    <TableCell>Ghi chú</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.map((record, index) => (
                    <TableRow 
                      key={record.student_id}
                      sx={{ 
                        bgcolor: scannedStudentId === record.student_id ? 'rgba(46, 125, 50, 0.1)' : 'inherit',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            {record.student_name.charAt(0)}
                          </Avatar>
                          {record.student_name}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={record.present === true}
                          icon={<CheckCircleIcon color="disabled" />}
                          checkedIcon={<CheckCircleIcon color="success" />}
                          onChange={() => record.present !== true && handleTogglePresent(record.student_id)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={record.present === false}
                          icon={<CancelIcon color="disabled" />}
                          checkedIcon={<CancelIcon color="error" />}
                          onChange={() => record.present !== false && handleTogglePresent(record.student_id)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Ghi chú"
                          value={record.notes || ''}
                          onChange={(e) => handleNotesChange(record.student_id, e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {record.saved ? (
                          <Chip 
                            label="Đã lưu" 
                            color="success" 
                            size="small" 
                            variant="outlined"
                          />
                        ) : record.present !== null ? (
                          <Chip 
                            label="Chưa lưu" 
                            color="warning" 
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Chip 
                            label="Chưa điểm danh" 
                            color="default" 
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {selectedClass && attendanceRecords.length === 0 && (
          <Box mt={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Không có học sinh nào trong lớp học này.
            </Typography>
          </Box>
        )}
        
        {!selectedClass && (
          <Box mt={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Vui lòng chọn lớp học để bắt đầu điểm danh.
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Dialog quét mã QR */}
      <Dialog
        open={scannerDialog}
        onClose={handleCloseQrScanner}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Quét mã QR điểm danh</DialogTitle>
        <DialogContent>
          {scannedStudentId ? (
            <Box textAlign="center" p={2}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Điểm danh thành công!
              </Typography>
              <Typography variant="body1">
                {attendanceRecords.find(r => r.student_id === scannedStudentId)?.student_name}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setScannedStudentId(null);
                  setScanning(true);
                  
                  // Khởi động lại scanner
                  if (scanner) {
                    scanner.clear();
                  }
                  
                  setTimeout(() => {
                    if (qrScannerRef.current) {
                      const html5QrcodeScanner = new Html5QrcodeScanner(
                        "qr-reader",
                        { fps: 10, qrbox: 250 },
                        /* verbose= */ false
                      );
                      
                      html5QrcodeScanner.render((decodedText) => {
                        processQrCode(decodedText);
                      }, (error) => {
                        // Bỏ qua lỗi
                      });
                      
                      setScanner(html5QrcodeScanner);
                    }
                  }, 500);
                }}
                sx={{ mt: 2 }}
              >
                Quét tiếp
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                Đưa mã QR của học sinh vào khung hình để điểm danh.
              </Typography>
              
              <Box 
                ref={qrScannerRef} 
                id="qr-reader" 
                sx={{ 
                  width: '100%', 
                  margin: '0 auto',
                  '& video': { borderRadius: 1 }
                }}
              />
              
              {scanning && (
                <Box textAlign="center" mt={2}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary" display="inline">
                    Đang quét...
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrScanner}>Đóng</Button>
          <Button 
            color="primary"
            variant="contained"
            onClick={handleSaveAttendance}
            disabled={!hasChanges}
          >
            Lưu điểm danh
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog gửi thông báo */}
      <Dialog
        open={notificationDialog}
        onClose={handleCloseNotificationDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Gửi thông báo vắng học</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Chọn loại thông báo:
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Loại thông báo</InputLabel>
            <Select
              value={notificationType}
              onChange={handleNotificationTypeChange}
              label="Loại thông báo"
            >
              <MenuItem value="absence">Thông báo vắng học</MenuItem>
              <MenuItem value="payment">Nhắc nhở đóng học phí</MenuItem>
              <MenuItem value="exam">Thông báo điểm kiểm tra</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nội dung thông báo"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            margin="normal"
            helperText="Sử dụng [tên học sinh] để thay thế bằng tên của từng học sinh"
          />
          
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              Chọn học sinh để gửi thông báo:
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedStudents.length === absentStudents.length}
                  indeterminate={selectedStudents.length > 0 && selectedStudents.length < absentStudents.length}
                  onChange={handleSelectAllStudents}
                />
              }
              label="Chọn tất cả"
            />
            
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>Học sinh</TableCell>
                    <TableCell>SĐT Phụ huynh</TableCell>
                    <TableCell>Zalo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {absentStudents.map((record) => (
                    <TableRow key={record.student_id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedStudents.includes(record.student_id)}
                          onChange={() => handleSelectStudent(record.student_id)}
                        />
                      </TableCell>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>{record.student?.parent_phone || 'Chưa có'}</TableCell>
                      <TableCell>
                        {record.student?.parent_zalo ? (
                          <Chip 
                            icon={<CheckCircleIcon />} 
                            label={record.student.parent_zalo} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                        ) : (
                          <Chip 
                            icon={<WarningIcon />} 
                            label="Chưa có Zalo" 
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Thông báo sẽ được gửi qua Zalo đến số điện thoại phụ huynh đã đăng ký.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotificationDialog}>Hủy</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSendNotifications}
            disabled={selectedStudents.length === 0}
          >
            Gửi thông báo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Attendance;
