import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  School as SchoolIcon,
  Class as ClassIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  Today as TodayIcon,
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import QRCode from 'qrcode.react';

import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  getStudentByUserId,
  getEnrollments,
  getAttendance,
  getPayments,
  getClasses
} from '../../services/supabase/database';

function UserDashboard() {
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [activeClasses, setActiveClasses] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState([]);
  
  useEffect(() => {
    fetchStudentData();
  }, [user]);
  
const fetchStudentData = async () => {
  if (!user?.id) {
    console.warn('User ID không tồn tại');
    return;
  }

  setLoading(true);
  try {
    // 1. Lấy thông tin học sinh - xử lý kỹ trường hợp null
    const { data: studentData = null, error: studentError } = await getStudentByUserId(user.id);
    
    if (studentError || !studentData) {
      const errorMsg = studentError?.message || 'Không tìm thấy thông tin học sinh';
      throw new Error(errorMsg);
    }

    // 2. Kiểm tra studentData.id trước khi sử dụng
    if (!studentData.id) {
      throw new Error('ID học sinh không hợp lệ');
    }

    setStudent(studentData);

    // 3. Lấy các dữ liệu phụ - thêm try-catch riêng cho từng API
    let enrollmentData = [];
    let classesData = [];
    let attendanceData = [];
    let paymentData = [];

    try {
      const results = await Promise.allSettled([
        getEnrollments(null, studentData.id),
        getClasses(),
        getAttendance(null, studentData.id),
        getPayments(studentData.id)
      ]);

      // Xử lý từng kết quả
      enrollmentData = results[0].status === 'fulfilled' ? results[0].value.data || [] : [];
      classesData = results[1].status === 'fulfilled' ? results[1].value.data || [] : [];
      attendanceData = results[2].status === 'fulfilled' ? results[2].value.data || [] : [];
      paymentData = results[3].status === 'fulfilled' ? results[3].value.data || [] : [];

      // Log lỗi nếu có
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Lỗi API ${['enrollment', 'classes', 'attendance', 'payments'][index]}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu phụ:', error);
    }

    // 4. Xử lý dữ liệu với fallback mặc định và optional chaining
    const activeClassIds = (enrollmentData || [])
      .filter(e => e?.status === 'active')
      .map(e => e?.class_id)
      .filter(Boolean); // Loại bỏ giá trị undefined/null

    const activeClassesData = (classesData || [])
      .filter(c => c?.is_active && activeClassIds.includes(c?.id));

    setEnrollments(enrollmentData);
    setActiveClasses(activeClassesData);

    // 5. Xử lý attendance - thêm kiểm tra định dạng ngày
    const today = dayjs().format('DD-MM-YYYY');
    const sevenDaysAgo = dayjs().subtract(7, 'day').format('DD-MM-YYYY');

    const safeAttendanceData = attendanceData || [];
    const processedAttendance = safeAttendanceData
      .filter(a => {
        try {
          return a?.date && dayjs(a.date, 'DD-MM-YYYY').isValid();
        } catch {
          return false;
        }
      });

    setRecentAttendance(
      processedAttendance
        .filter(a => dayjs(a.date, 'DD-MM-YYYY').isSameOrAfter(sevenDaysAgo))
        .sort((a, b) => dayjs(b.date, 'DD-MM-YYYY').diff(dayjs(a.date, 'DD-MM-YYYY')))
    );

    setTodayAttendance(
      processedAttendance.filter(a => a.date === today)
    );

    // 6. Xử lý payments - thêm kiểm tra ngày thanh toán
    const safePaymentData = paymentData || [];
    const processedPayments = safePaymentData
      .filter(p => p?.payment_date && dayjs(p.payment_date).isValid())
      .sort((a, b) => dayjs(b.payment_date).diff(dayjs(a.payment_date)))
      .slice(0, 5);

    setPayments(processedPayments);

  } catch (error) {
    console.error('Lỗi chính:', {
      message: error.message,
      stack: error.stack,
      user: user?.id
    });
    showNotification(error.message || 'Có lỗi xảy ra khi tải dữ liệu', 'error');
  } finally {
    setLoading(false);
  }
};
  
  const handleToggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Xin chào, {user?.user_metadata?.full_name || 'Học sinh'}!
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Chào mừng bạn đến với hệ thống quản lý lớp học của chúng tôi.
      </Typography>
      
      <Grid container spacing={3} mb={4}>
        {/* Thông tin cá nhân */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Typography variant="h6" gutterBottom>
                  Thông tin cá nhân
                </Typography>
                
                {student ? (
                  <List dense>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <SchoolIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Họ và tên"
                        secondary={student.full_name}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <EventNoteIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Ngày sinh"
                        secondary={student.date_of_birth ? dayjs(student.date_of_birth).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <SchoolIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Trường"
                        secondary={student.school || 'Chưa cập nhật'}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <ClassIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Lớp"
                        secondary={student.grade || 'Chưa cập nhật'}
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Alert severity="warning">
                    Không tìm thấy thông tin học sinh
                  </Alert>
                )}
              </Box>
              
              <Box>
                <Button 
                  variant={showQRCode ? "outlined" : "contained"}
                  startIcon={<QrCodeIcon />}
                  onClick={handleToggleQRCode}
                >
                  {showQRCode ? "Ẩn mã QR" : "Hiện mã QR"}
                </Button>
                
                {showQRCode && student?.qr_code && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <QRCode 
                      value={student.qr_code} 
                      size={150}
                      level="H"
                      includeMargin
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Dùng mã này để điểm danh
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Các lớp học đang tham gia */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Lớp học đang tham gia ({activeClasses.length})
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {activeClasses.length > 0 ? (
              <List>
                {activeClasses.map((classItem) => (
                  <ListItem key={classItem.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ClassIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={classItem.name}
                      secondary={`Môn học: ${classItem.subject_id ? classItem.subject?.name : 'N/A'} | Lịch học: ${classItem.schedule || 'Xem chi tiết'}`}
                    />
                    <ListItemSecondaryAction>
                      <Button 
                        size="small" 
                        variant="outlined"
                        endIcon={<ArrowForwardIcon />}
                        href={`/user/classes/${classItem.id}`}
                      >
                        Chi tiết
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                Bạn chưa đăng ký lớp học nào. 
                <Button size="small" href="/user/classes" sx={{ ml: 1 }}>
                  Đăng ký ngay
                </Button>
              </Alert>
            )}
            
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button 
                variant="contained" 
                color="primary"
                href="/user/classes"
              >
                Xem tất cả lớp học
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Điểm danh hôm nay */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Điểm danh hôm nay" 
              subheader={dayjs().format('DD/MM/YYYY')}
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TodayIcon />
                </Avatar>
              }
            />
            
            <Divider />
            
            <CardContent>
              {todayAttendance.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Lớp học</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                        <TableCell>Ghi chú</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todayAttendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.classes?.name || 'N/A'}</TableCell>
                          <TableCell align="center">
                            {record.status ? (
                              <Chip 
                                icon={<CheckCircleIcon />} 
                                label="Có mặt" 
                                color="success" 
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Chip 
                                icon={<CancelIcon />} 
                                label="Vắng mặt" 
                                color="error" 
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell>{record.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Bạn chưa được điểm danh hôm nay
                </Alert>
              )}
            </CardContent>
            
            <Divider />
            
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" color="primary" href="/user/attendance">
                Xem lịch sử điểm danh
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Thanh toán gần đây */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Thanh toán gần đây" 
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <PaymentIcon />
                </Avatar>
              }
            />
            
            <Divider />
            
            <CardContent>
              {payments.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Lớp học</TableCell>
                        <TableCell align="right">Số tiền</TableCell>
                        <TableCell>Ngày thanh toán</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.classes?.name || 'N/A'}</TableCell>
                          <TableCell align="right">{payment.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                          <TableCell>{dayjs(payment.payment_date).format('DD/MM/YYYY')}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={payment.status === 'completed' ? 'Đã thanh toán' : 'Đang xử lý'} 
                              color={payment.status === 'completed' ? 'success' : 'warning'} 
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Chưa có lịch sử thanh toán
                </Alert>
              )}
            </CardContent>
            
            <Divider />
            
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" color="primary" href="/user/payments">
                Xem lịch sử thanh toán
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserDashboard;
