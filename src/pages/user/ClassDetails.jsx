import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  CalendarMonth as CalendarMonthIcon,
  Group as GroupIcon,
  MonetizationOn as MonetizationOnIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  getClassById,
  getStudentByUserId,
  getEnrollments,
  getAttendance,
  getExamResults
} from '../../services/supabase/database';

function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [classData, setClassData] = useState(null);
  const [student, setStudent] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  
  useEffect(() => {
    if (id && user) {
      fetchClassDetails();
    }
  }, [id, user]);
  
  const fetchClassDetails = async () => {
    setLoading(true);
    try {
      // Lấy thông tin lớp học
      const { data: classInfo, error: classError } = await getClassById(id);
      if (classError) throw classError;
      
      if (!classInfo) {
        showNotification('Không tìm thấy thông tin lớp học', 'error');
        navigate('/user/class-registration');
        return;
      }
      
      setClassData(classInfo);
      
      // Lấy thông tin học sinh
      const { data: studentData, error: studentError } = await getStudentByUserId(user.id);
      if (studentError) throw studentError;
      
      if (!studentData) {
        showNotification('Không tìm thấy thông tin học sinh', 'error');
        return;
      }
      
      setStudent(studentData);
      
      // Kiểm tra học sinh đã đăng ký lớp này chưa
      const { data: enrollmentData, error: enrollmentError } = await getEnrollments(id, studentData.id);
      if (enrollmentError) throw enrollmentError;
      
      setIsEnrolled(enrollmentData && enrollmentData.length > 0 && enrollmentData[0].status === 'active');
      
      // Nếu đã đăng ký, lấy thông tin điểm danh
      if (isEnrolled) {
        const { data: attendanceData, error: attendanceError } = await getAttendance(id, studentData.id);
        if (attendanceError) throw attendanceError;
        
        // Sắp xếp theo ngày mới nhất
        const sortedAttendance = attendanceData?.sort((a, b) => 
          dayjs(b.date).diff(dayjs(a.date))
        ) || [];
        
        setAttendance(sortedAttendance);
        
        // Lấy kết quả kiểm tra
        const { data: examData, error: examError } = await getExamResults(id, studentData.id);
        if (examError) throw examError;
        
        setExams(examData || []);
      }
      
    } catch (error) {
      console.error('Error fetching class details:', error);
      showNotification('Lỗi khi tải thông tin lớp học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const getAttendanceStats = () => {
    if (!attendance.length) return { present: 0, absent: 0, rate: 0 };
    
    const present = attendance.filter(a => a.status).length;
    const absent = attendance.length - present;
    const rate = (present / attendance.length) * 100;
    
    return { present, absent, rate: rate.toFixed(1) };
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        
        <Typography variant="h4">
          {classData?.name || 'Chi tiết lớp học'}
        </Typography>
      </Box>
      
      {classData && (
        <Grid container spacing={3}>
          {/* Thông tin lớp học */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Thông tin lớp học
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Môn học"
                    secondary={classData.subject?.name || 'Không xác định'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <EventNoteIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lịch học"
                    secondary={classData.schedule || 'Chưa cập nhật'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarMonthIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Thời gian"
                    secondary={`${dayjs(classData.start_date).format('DD/MM/YYYY')} - ${dayjs(classData.end_date).format('DD/MM/YYYY')}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <MonetizationOnIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Học phí"
                    secondary={`${classData.fee.toLocaleString('vi-VN')} VNĐ`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <GroupIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sĩ số"
                    secondary={`${classData.current_students || 0}/${classData.max_students || 'Không giới hạn'}`}
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Trạng thái lớp học
              </Typography>
              
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {classData.is_active ? (
                  <Chip
                    label="Đang mở"
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    label="Đã đóng"
                    color="error"
                    variant="outlined"
                  />
                )}
                
                {dayjs(classData.start_date).isAfter(dayjs()) ? (
                  <Chip
                    label="Sắp khai giảng"
                    color="info"
                    variant="outlined"
                  />
                ) : dayjs(classData.end_date).isBefore(dayjs()) ? (
                  <Chip
                    label="Đã kết thúc"
                    color="default"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    label="Đang diễn ra"
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {isEnrolled && (
                  <Chip
                    label="Đã đăng ký"
                    color="success"
                    icon={<CheckCircleIcon />}
                  />
                )}
              </Box>
              
              {classData.description && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Mô tả
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {classData.description}
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>
          
          {/* Nội dung chính */}
          <Grid item xs={12} md={8}>
            {!isEnrolled ? (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Bạn chưa đăng ký lớp học này
                </Alert>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/user/class-registration')}
                >
                  Đăng ký ngay
                </Button>
              </Paper>
            ) : (
              <>
                {/* Thống kê điểm danh */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Thống kê điểm danh
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Tổng buổi
                          </Typography>
                          <Typography variant="h5">
                            {attendance.length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Có mặt
                          </Typography>
                          <Typography variant="h5" color="success.main">
                            {getAttendanceStats().present}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Tỷ lệ đi học
                          </Typography>
                          <Typography variant="h5" color={getAttendanceStats().rate >= 80 ? 'success.main' : 'error.main'}>
                            {getAttendanceStats().rate}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Lịch sử điểm danh gần đây
                  </Typography>
                  
                  {attendance.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Ngày</TableCell>
                            <TableCell align="center">Trạng thái</TableCell>
                            <TableCell>Ghi chú</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {attendance.slice(0, 5).map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{dayjs(record.date).format('DD/MM/YYYY')}</TableCell>
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
                      Chưa có dữ liệu điểm danh
                    </Alert>
                  )}
                  
                  {attendance.length > 5 && (
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate('/user/attendance')}
                      >
                        Xem tất cả
                      </Button>
                    </Box>
                  )}
                </Paper>
                
                {/* Kết quả kiểm tra */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Kết quả học tập
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {exams.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Bài kiểm tra</TableCell>
                            <TableCell>Ngày thi</TableCell>
                            <TableCell align="right">Điểm số</TableCell>
                            <TableCell>Ghi chú</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {exams.map((exam) => (
                            <TableRow key={exam.id}>
                              <TableCell>{exam.exams?.title || 'N/A'}</TableCell>
                              <TableCell>{dayjs(exam.exams?.exam_date).format('DD/MM/YYYY')}</TableCell>
                              <TableCell align="right">
                                <Typography 
                                  variant="body1" 
                                  color={
                                    exam.score >= 8 ? 'success.main' : 
                                    exam.score >= 6.5 ? 'primary.main' : 
                                    exam.score >= 5 ? 'warning.main' : 'error.main'
                                  }
                                  fontWeight="bold"
                                >
                                  {exam.score}/{exam.exams?.max_score || 10}
                                </Typography>
                              </TableCell>
                              <TableCell>{exam.notes || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      Chưa có kết quả kiểm tra nào
                    </Alert>
                  )}
                </Paper>
              </>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default ClassDetails;
