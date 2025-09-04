import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
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
// Bổ sung lấy lịch học & giáo viên giống dialog ở trang đăng ký
import { getClassTeachers, getSchedulesForClasses } from '../../services/supabase/classes';

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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [detailTeachers, setDetailTeachers] = useState([]);
  const [schedulesMap, setSchedulesMap] = useState({}); // { classId: [schedules] }
  
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

    // Tải lịch học cho các lớp đang active (tương tự ClassRegistration)
    const classIds = activeClassesData.map(c => c.id).filter(Boolean);
    if (classIds.length) {
      try {
        const { data: schedules, error: schedErr } = await getSchedulesForClasses(classIds);
        if (!schedErr && Array.isArray(schedules)) {
          const map = {};
            schedules.forEach(s => {
              if (!map[s.class_id]) map[s.class_id] = [];
              map[s.class_id].push(s);
            });
            Object.keys(map).forEach(k => {
              map[k].sort((a,b)=>{
                const da = parseInt(a.day_of_week,10); const db = parseInt(b.day_of_week,10);
                if (da !== db) return (da===0?7:da) - (db===0?7:db); // CN xuống cuối
                return (a.start_time||'').localeCompare(b.start_time||'');
              });
            });
          setSchedulesMap(map);
        }
      } catch (e) {
        console.warn('Không tải được lịch học:', e);
      }
    } else {
      setSchedulesMap({});
    }

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

  const handleOpenClassDetail = async (cls) => {
    setSelectedClass(cls);
    // Lấy giáo viên
    try {
      const { data: teachers } = await getClassTeachers(cls.id);
      setDetailTeachers(teachers || []);
    } catch (_) {
      setDetailTeachers([]);
    }
    setDetailDialogOpen(true);
  };

  const handleCloseClassDetail = () => {
    setDetailDialogOpen(false);
    setSelectedClass(null);
    setDetailTeachers([]);
  };

  // Helper xây từng dòng lịch học giống bên ClassRegistration
  const dayNames = { '1':'Thứ 2','2':'Thứ 3','3':'Thứ 4','4':'Thứ 5','5':'Thứ 6','6':'Thứ 7','0':'CN' };
  const getScheduleLines = (classId) => {
    const list = schedulesMap[classId] || [];
    if (!list.length) return [];
    return list.map(s => {
      const dn = dayNames[String(s.day_of_week)] || s.day_of_week;
      const time = `${(s.start_time||'').slice(0,5)}-${(s.end_time||'').slice(0,5)}`;
      const room = s.location ? ` (${s.location})` : '';
      return `${dn} ${time}${room}`;
    });
  };

  return (
    <Box sx={{ minHeight:'100vh', backgroundColor:'background.default', p:2 }}>
      {/* Header đơn giản */}
      <Box sx={{ backgroundColor:'primary.main', color:'#fff', borderRadius:2, p:3, mb:3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Xin chào, {student?.full_name || user?.user_metadata?.full_name || 'Học sinh'}
        </Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1, flexWrap:'wrap', fontSize:'0.85rem' }}>
          <Box>Mã học sinh:</Box>
          <Chip label={student?.id || 'N/A'} size="small" sx={{ bgcolor:'rgba(255,255,255,0.2)', color:'#fff' }} />
          <Box sx={{ opacity:0.9 }}>Theo dõi tiến trình học tập của bạn tại đây.</Box>
        </Box>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor:'#fff', border:'1px solid #e5e7eb' }}>
            <CardContent sx={{ textAlign:'center', p:2 }}>
              <Typography variant="h5" fontWeight={600}>{activeClasses.length}</Typography>
              <Typography variant="body2">Lớp đang học</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor:'#fff', border:'1px solid #e5e7eb' }}>
            <CardContent sx={{ textAlign:'center', p:2 }}>
              <Typography variant="h5" fontWeight={600}>{recentAttendance.filter(a => a.status === 'present').length}</Typography>
              <Typography variant="body2">Buổi đã tham dự</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor:'#fff', border:'1px solid #e5e7eb' }}>
            <CardContent sx={{ textAlign:'center', p:2 }}>
              <Typography variant="h5" fontWeight={600}>{payments.filter(p => p.status === 'completed').length}</Typography>
              <Typography variant="body2">Đã thanh toán</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor:'#fff', border:'1px solid #e5e7eb' }}>
            <CardContent sx={{ textAlign:'center', p:2 }}>
              <Typography variant="h5" fontWeight={600}>{todayAttendance.length}</Typography>
              <Typography variant="body2">Lớp hôm nay</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content Cards */}
      <Grid container spacing={3} mb={4}>
        {/* Thông tin cá nhân */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius:2 }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" fontWeight="600">Thông tin cá nhân</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    
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
                        <ListItemText
                          disableTypography
                          primary={<Box sx={{ fontWeight: 'medium' }}>👨‍🎓 Họ và tên</Box>}
                          secondary={<Box sx={{ color: 'primary.main', fontWeight: 'bold' }}>{student.full_name}</Box>}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          disableTypography
                          primary={<Box sx={{ fontWeight: 'medium' }}>🎂 Ngày sinh</Box>}
                          secondary={<Box>{student.date_of_birth ? dayjs(student.date_of_birth).format('DD/MM/YYYY') : 'Chưa cập nhật'}</Box>}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          disableTypography
                          primary={<Box sx={{ fontWeight: 'medium' }}>🏫 Trường</Box>}
                          secondary={<Box>{student.school || 'Chưa cập nhật'}</Box>}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 0 }}>
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
                    variant={showQRCode ? 'outlined':'contained'}
                    onClick={handleToggleQRCode}
                    sx={{ 
                      borderRadius:2
                    }}
                  >
                    {showQRCode ? 'Ẩn mã QR':'Hiện mã QR'}
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
          <Card sx={{ borderRadius:2, height:'100%' }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" fontWeight={600}>Lớp học đang tham gia ({activeClasses.length})</Typography>
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
                      <ListItemText
                        disableTypography
                        primary={
                          <Box sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1rem' }}>
                            {classItem.name}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Chip 
                              label={`${classItem.schedule || 'Xem chi tiết'}`} 
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
                          variant="outlined"
                          onClick={() => handleOpenClassDetail(classItem)}
                          sx={{
                            borderRadius:2
                          }}
                        >
                          Chi tiết
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
                <Button variant="outlined" href="/student/classes" sx={{ borderRadius:2 }}>
                  Xem lớp học
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
          <Card sx={{ borderRadius:2 }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" fontWeight={600}>Điểm danh hôm nay</Typography>
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
                          label={record.status === 'present' ? 'Có mặt' : 'Vắng'} 
                          color={record.status === 'present' ? 'success' : 'error'} 
                          size="small"
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
          <Card sx={{ borderRadius:2 }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography component="div" fontWeight={600}>Lịch sử thanh toán</Typography>
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
            
            <CardActions sx={{ justifyContent:'center', p:2 }}>
              <Button variant="outlined" href="/user/payments" sx={{ borderRadius:2 }}>Xem lịch sử thanh toán</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      {/* Class Detail Dialog (đầy đủ) */}
      <Dialog open={detailDialogOpen} onClose={handleCloseClassDetail} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết lớp học</DialogTitle>
        <DialogContent dividers>
          {selectedClass && (
            <Box component="table" sx={{ width:'100%', borderCollapse:'separate', borderSpacing: '0 6px' }}>
              <tbody>
                <tr>
                  <td style={{verticalAlign:'top', width:140, fontWeight:600}}>Tên lớp</td>
                  <td>{selectedClass.name}</td>
                </tr>
                <tr>
                  <td style={{verticalAlign:'top', fontWeight:600}}>Môn học</td>
                  <td>{selectedClass.subject?.name || 'Không xác định'}</td>
                </tr>
                <tr>
                  <td style={{verticalAlign:'top', fontWeight:600}}>Giáo viên</td>
                  <td>{detailTeachers.length ? detailTeachers.map(t=>t.full_name).filter(Boolean).join(', ') : 'Chưa cập nhật'}</td>
                </tr>
                <tr>
                  <td style={{verticalAlign:'top', fontWeight:600}}>Lịch học</td>
                  <td>{(() => { const lines = getScheduleLines(selectedClass.id); return lines.length ? lines.map((l,i)=>(<div key={i}>{l}</div>)) : 'Chưa cập nhật'; })()}</td>
                </tr>
                {selectedClass.fee != null && (
                  <tr>
                    <td style={{verticalAlign:'top', fontWeight:600}}>Học phí</td>
                    <td>{Number(selectedClass.fee).toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                )}
                <tr>
                  <td style={{verticalAlign:'top', fontWeight:600}}>Trạng thái</td>
                  <td>
                    <Chip 
                      label={selectedClass.is_active ? 'Đang hoạt động' : 'Đã kết thúc'}
                      color={selectedClass.is_active ? 'success' : 'default'}
                      size="small"/>
                  </td>
                </tr>
                {selectedClass.description && (
                  <tr>
                    <td style={{verticalAlign:'top', fontWeight:600}}>Mô tả</td>
                    <td style={{whiteSpace:'pre-line'}}>{selectedClass.description}</td>
                  </tr>
                )}
              </tbody>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClassDetail}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserDashboard;
