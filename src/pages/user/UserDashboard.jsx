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
    return;
  }

  setLoading(true);
  try {
    // 1. Lấy thông tin học sinh - xử lý kỹ trường hợp null
    const { data: studentData = null, error: studentError } = await getStudentByUserId(user.id);
    
    if (studentError) {
      // API returned an error
      throw new Error(studentError?.message || 'Lỗi khi tải thông tin học sinh');
    }

    if (!studentData) {
      // No student found for this user — show a friendly message and stop further processing
      showNotification('Không tìm thấy thông tin học sinh', 'warning');
      return;
    }

    // 2. Kiểm tra và chuẩn hoá id: một số bản ghi lưu key dưới `user_id`
    const effectiveId = studentData?.id || studentData?.user_id;
    if (!effectiveId) {
      showNotification('ID học sinh không hợp lệ', 'error');
      return;
    }

    // Chuẩn hóa trường `id` để phần còn lại của component có thể dùng thống nhất
    studentData.id = effectiveId;

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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a8b8e6 0%, #c8a2c8 100%)',
      p: 1
    }}>
      {/* Header với gradient */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #81c784 0%, #aed581 100%)',
        borderRadius: 3,
        p: 4,
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
        }} />
        <Box sx={{ 
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
        }} />
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              👋 Xin chào, {student?.full_name || user?.user_metadata?.full_name || 'Học sinh'}!
            </Typography>
            <Box sx={{ opacity: 0.9, mb: 2, fontSize: '1.1rem', fontWeight: 'medium' }}>
              🎓 Mã học sinh: <Chip label={student?.id || 'N/A'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} />
            </Box>
            <Box sx={{ opacity: 0.8, fontSize: '1rem' }}>
              Chào mừng bạn đến với bảng điều khiển học tập! Hãy cùng theo dõi tiến trình học tập của bạn.
            </Box>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Avatar
              src={student?.avatar_url || user?.user_metadata?.avatar_url}
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto',
                border: '4px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }}
            >
              {student?.full_name?.charAt(0) || user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}
            </Avatar>
          </Grid>
        </Grid>
      </Box>

      {/* Stats Cards với gradient */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-3px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <SchoolIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {activeClasses.length}
              </Typography>
              <Box sx={{ opacity: 0.9, fontSize: '1rem', fontWeight: 'medium' }}>
                📚 Lớp đang học
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f48fb1 0%, #e91e63 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-3px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <EventNoteIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {recentAttendance.filter(a => a.status === 'present').length}
              </Typography>
              <Box sx={{ opacity: 0.9, fontSize: '1rem', fontWeight: 'medium' }}>
                ✅ Buổi đã tham dự
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-3px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <PaymentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {payments.filter(p => p.status === 'completed').length}
              </Typography>
              <Box sx={{ opacity: 0.9, fontSize: '1rem', fontWeight: 'medium' }}>
                💰 Đã thanh toán
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-3px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <TodayIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {todayAttendance.length}
              </Typography>
              <Box sx={{ opacity: 0.9, fontSize: '1rem', fontWeight: 'medium' }}>
                📅 Lớp hôm nay
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content Cards */}
      <Grid container spacing={3} mb={4}>
        {/* Thông tin cá nhân */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SchoolIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    👤 Thông tin cá nhân
                  </Typography>
                </Box>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box flex={1}>
                  {student ? (
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.light' }}>
                            <SchoolIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          disableTypography
                          primary={<Box sx={{ fontWeight: 'medium' }}>👨‍🎓 Họ và tên</Box>}
                          secondary={<Box sx={{ color: 'primary.main', fontWeight: 'bold' }}>{student.full_name}</Box>}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.light' }}>
                            <EventNoteIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          disableTypography
                          primary={<Box sx={{ fontWeight: 'medium' }}>🎂 Ngày sinh</Box>}
                          secondary={<Box>{student.date_of_birth ? dayjs(student.date_of_birth).format('DD/MM/YYYY') : 'Chưa cập nhật'}</Box>}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.light' }}>
                            <SchoolIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          disableTypography
                          primary={<Box sx={{ fontWeight: 'medium' }}>🏫 Trường</Box>}
                          secondary={<Box>{student.school || 'Chưa cập nhật'}</Box>}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.light' }}>
                            <ClassIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          disableTypography
                          primary={<Box sx={{ fontWeight: 'medium' }}>📚 Lớp</Box>}
                          secondary={<Box>{student.grade || 'Chưa cập nhật'}</Box>}
                        />
                      </ListItem>
                    </List>
                  ) : (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      ⚠️ Không tìm thấy thông tin học sinh
                    </Alert>
                  )}
                </Box>
                
                <Box sx={{ ml: 2 }}>
                  <Button 
                    variant={showQRCode ? "outlined" : "contained"}
                    startIcon={<QrCodeIcon />}
                    onClick={handleToggleQRCode}
                    sx={{ 
                      borderRadius: 2,
                      background: showQRCode ? 'transparent' : 'linear-gradient(135deg, #5c9bd5 0%, #70a288 100%)',
                      '&:hover': {
                        background: showQRCode ? 'rgba(92,155,213,0.1)' : 'linear-gradient(135deg, #4a90d9 0%, #5d8a73 100%)'
                      }
                    }}
                  >
                    {showQRCode ? "🙈 Ẩn mã QR" : "📱 Hiện mã QR"}
                  </Button>
                  
                  {showQRCode && student?.user_id && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2,
                      textAlign: 'center',
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}>
                      <QRCode 
                        value={student.user_id} 
                        size={150}
                        level="H"
                        includeMargin
                      />
                      <Box sx={{ mt: 1, fontWeight: 'medium', fontSize: '0.75rem' }}>
                        📋 Dùng mã này để điểm danh
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Các lớp học đang tham gia */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <ClassIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    📚 Lớp học đang tham gia ({activeClasses.length})
                  </Typography>
                </Box>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0, height: 'calc(100% - 140px)', overflow: 'auto' }}>
              {activeClasses.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {activeClasses.map((classItem, index) => (
                    <ListItem 
                      key={classItem.id} 
                      sx={{ 
                        px: 0,
                        py: 1,
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: index % 2 === 0 ? 'rgba(92,155,213,0.05)' : 'rgba(244,143,177,0.05)',
                        border: '1px solid',
                        borderColor: index % 2 === 0 ? 'rgba(92,155,213,0.1)' : 'rgba(244,143,177,0.1)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: index % 2 === 0 ? 'rgba(92,155,213,0.1)' : 'rgba(244,143,177,0.1)',
                          transform: 'translateX(5px)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: index % 2 === 0 ? 'primary.main' : 'secondary.main',
                          width: 48,
                          height: 48
                        }}>
                          <ClassIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        disableTypography
                        primary={
                          <Box sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1rem' }}>
                            🎓 {classItem.name}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.875rem' }}>
                              📖 Môn: {classItem.subject_id ? classItem.subject?.name || 'N/A' : 'N/A'}
                            </Box>
                            <Chip 
                              label={`📅 ${classItem.schedule || 'Xem chi tiết'}`} 
                              size="small" 
                              sx={{ 
                                bgcolor: index % 2 === 0 ? 'primary.light' : 'secondary.light',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                              }} 
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button 
                          size="small" 
                          variant="contained"
                          endIcon={<ArrowForwardIcon />}
                          href={`/user/classes/${classItem.id}`}
                          sx={{
                            bgcolor: index % 2 === 0 ? 'primary.main' : 'secondary.main',
                            '&:hover': {
                              bgcolor: index % 2 === 0 ? 'primary.dark' : 'secondary.dark',
                              transform: 'scale(1.05)'
                            },
                            borderRadius: 2
                          }}
                        >
                          📋 Chi tiết
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Box sx={{ fontWeight: 'medium' }}>
                    📚 Bạn chưa đăng ký lớp học nào.
                  </Box>
                  <Button 
                    size="small" 
                    href="/user/classes" 
                    sx={{ 
                      ml: 1,
                      bgcolor: 'info.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'info.dark' }
                    }}
                  >
                    🚀 Đăng ký ngay
                  </Button>
                </Alert>
              )}
            </CardContent>
            
            {activeClasses.length > 0 && (
              <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  href="/user/classes"
                  startIcon={<ArrowForwardIcon />}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #5c9bd5 0%, #70a288 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4a90d9 0%, #5d8a73 100%)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  🔍 Xem tất cả lớp học
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Cards */}
      <Grid container spacing={3}>
        {/* Điểm danh hôm nay */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <TodayIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    📅 Điểm danh hôm nay
                  </Typography>
                </Box>
              }
              subheader={
                <Box sx={{ mt: 1, fontWeight: 'medium', fontSize: '0.875rem' }}>
                  🗓️ {dayjs().format('dddd, DD/MM/YYYY')}
                </Box>
              }
              sx={{ pb: 1 }}
            />
            
            
            <CardContent sx={{ pt: 0 }}>
              {todayAttendance.length > 0 ? (
                <Box>
                  {todayAttendance.map((record, index) => (
                    <Box 
                      key={record.id}
                      sx={{ 
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: index % 2 === 0 ? 'rgba(255,193,7,0.1)' : 'rgba(76,175,80,0.1)',
                        border: '1px solid',
                        borderColor: index % 2 === 0 ? 'rgba(255,193,7,0.2)' : 'rgba(76,175,80,0.2)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography component="span"  fontWeight="bold" color="primary.main" display="block">
                            🏫 {record.classes?.name || 'N/A'}
                          </Typography>
                          <Typography component="span" color="text.secondary" display="block">
                            {record.notes || 'Không có ghi chú'}
                          </Typography>
                        </Box>
                        <Chip 
                          icon={record.status === 'present' ? <CheckCircleIcon /> : <CancelIcon />} 
                          label={record.status === 'present' ? '✅ Có mặt' : '❌ Vắng mặt'} 
                          color={record.status === 'present' ? 'success' : 'error'} 
                          variant="filled"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography fontWeight="medium" component="div">
                    🏠 Hôm nay bạn không có lớp học nào hoặc chưa được điểm danh
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Lịch sử thanh toán gần đây */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <PaymentIcon />
                  </Avatar>
                  <Typography  component="div" fontWeight="bold">
                    💰 Lịch sử thanh toán
                  </Typography>
                </Box>
              }
              subheader={
                <Typography component="div" sx={{ mt: 1, fontWeight: 'medium' }}>
                  📊 5 giao dịch gần nhất
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            
            <CardContent sx={{ pt: 0 }}>
              {payments.length > 0 ? (
                <Box>
                  {payments.slice(0, 5).map((payment, index) => (
                    <Box 
                      key={payment.id}
                      sx={{ 
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: payment.status === 'completed' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                        border: '1px solid',
                        borderColor: payment.status === 'completed' ? 'rgba(76,175,80,0.2)' : 'rgba(255,152,0,0.2)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography component="span" fontWeight="bold" color="primary.main" display="block">
                            🏫 {payment.classes?.name || 'N/A'}
                          </Typography>
                          <Typography component="span"  color="text.secondary" display="block">
                            📅 {dayjs(payment.payment_date).format('DD/MM/YYYY')}
                          </Typography>
                          <Typography component="span" fontWeight="bold" color="success.main" display="block">
                            💵 {payment.amount.toLocaleString('vi-VN')} VNĐ
                          </Typography>
                        </Box>
                        <Chip 
                          label={
                            payment.status === 'completed' 
                              ? '✅ Đã thanh toán' 
                              : payment.status === 'pending' 
                                ? '⏳ Đang xử lý' 
                                : '❌ Đã hủy'
                          }
                          color={
                            payment.status === 'completed' ? 'success' : 
                            payment.status === 'pending' ? 'warning' : 'error'
                          }
                          variant="filled"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography fontWeight="medium" component="div">
                    💳 Chưa có lịch sử thanh toán
                  </Typography>
                </Alert>
              )}
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'center', p: 2 }}>
              <Button 
                variant="contained"
                color="success" 
                href="/user/payments"
                startIcon={<PaymentIcon />}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)', // Softer green
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                    transform: 'translateY(-1px)' // Less movement
                  }
                }}
              >
                📊 Xem lịch sử thanh toán
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserDashboard;
