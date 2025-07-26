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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Event as EventIcon,
  MonetizationOn as MonetizationOnIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  getOpenClasses,
  enrollClass,
  getStudentByUserId,
  getEnrollments
} from '../../services/supabase/database';

function ClassRegistration() {
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchStudentData();
      fetchClasses();
    }
  }, [user]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClasses(classes);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = classes.filter(classItem => 
        classItem.name.toLowerCase().includes(lowercasedFilter) ||
        (classItem.subject?.name || '').toLowerCase().includes(lowercasedFilter) ||
        (classItem.level || '').toLowerCase().includes(lowercasedFilter)
      );
      setFilteredClasses(filtered);
    }
  }, [searchTerm, classes]);

const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Lấy thông tin học sinh
      const { data, error } = await getStudentByUserId(user.id);
      if (error) throw error;
      
      // Nếu không có data, coi như học sinh chưa được tạo và không báo lỗi
      setStudent(data || null);
      
      // Chỉ lấy danh sách lớp nếu có thông tin học sinh
      if (data?.id) {
        const { data: enrollmentData, error: enrollmentError } = await getEnrollments(null, data.id);
        if (enrollmentError) throw enrollmentError;
        
        setEnrollments(enrollmentData || []);
      } else {
        setEnrollments([]);
      }
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Có thể bỏ qua không hiển thị thông báo lỗi nếu muốn
      // showNotification('Lỗi khi tải thông tin học sinh: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await getOpenClasses();
      if (error) throw error;
      
      // Nếu không có lớp nào, set thành mảng rỗng
      const classesData = data || [];
      setClasses(classesData);
      setFilteredClasses(classesData);
      
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Có thể bỏ qua không hiển thị thông báo lỗi nếu muốn
      // showNotification('Lỗi khi tải danh sách lớp học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDialog = (classItem) => {
    setSelectedClass(classItem);
    setConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(false);
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialog(false);
  };

  const isAlreadyEnrolled = (classId) => {
    return enrollments.some(e => e.class_id === classId && e.status === 'active');
  };

  const handleEnrollClass = async () => {
    if (!student || !selectedClass) return;
    
    setLoading(true);
    try {
      const enrollmentData = {
        student_id: student.id,
        class_id: selectedClass.id,
        enrolled_at: new Date().toISOString(),
        status: 'active'
      };
      
      const { error } = await enrollClass(enrollmentData);
      if (error) throw error;
      
      showNotification('Đăng ký lớp học thành công', 'success');
      
      // Cập nhật danh sách đăng ký
      fetchStudentData();
      
      // Đóng dialog xác nhận và mở dialog thành công
      handleCloseConfirmDialog();
      setSuccessDialog(true);
      
    } catch (error) {
      console.error('Error enrolling class:', error);
      showNotification('Lỗi khi đăng ký lớp học: ' + error.message, 'error');
      handleCloseConfirmDialog();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Đăng ký lớp học
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm lớp học theo tên, môn học hoặc trình độ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {!student ? (
        <Alert severity="warning">
          <AlertTitle>Thông báo</AlertTitle>
          Không tìm thấy thông tin học sinh. Vui lòng liên hệ với quản trị viên để được hỗ trợ.
        </Alert>
      ) : filteredClasses.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Thông báo</AlertTitle>
          Không tìm thấy lớp học nào phù hợp với tìm kiếm của bạn.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredClasses.map((classItem) => {
            const isEnrolled = isAlreadyEnrolled(classItem.id);
            const isFull = (classItem.max_students && 
                           classItem.current_students >= classItem.max_students);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  {isEnrolled && (
                    <Chip
                      label="Đã đăng ký"
                      color="primary"
                      icon={<CheckIcon />}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1
                      }}
                    />
                  )}
                  
                  <CardHeader
                    title={classItem.name}
                    subheader={classItem.subject?.name || 'Không xác định'}
                  />
                  
                  <Divider />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Trình độ: {classItem.level || 'Không xác định'}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Lịch học: {classItem.schedule || 'Xem chi tiết'}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <EventIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Thời gian: {dayjs(classItem.start_date).format('DD/MM/YYYY')} - {dayjs(classItem.end_date).format('DD/MM/YYYY')}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Học phí: {classItem.fee.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                    
                    {classItem.description && (
                      <Typography variant="body2" color="text.secondary">
                        {classItem.description.length > 100 
                          ? `${classItem.description.substring(0, 100)}...` 
                          : classItem.description}
                      </Typography>
                    )}
                    
                    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Sĩ số: {classItem.current_students || 0}/{classItem.max_students || 'Không giới hạn'}
                      </Typography>
                      
                      {isFull && (
                        <Chip 
                          label="Đã đầy" 
                          color="error" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      href={`/user/classes/${classItem.id}`}
                      startIcon={<InfoIcon />}
                    >
                      Chi tiết
                    </Button>
                    
                    <Button
                      size="small"
                      color="primary"
                      variant="contained"
                      disabled={isEnrolled || isFull}
                      onClick={() => handleOpenConfirmDialog(classItem)}
                      sx={{ ml: 'auto' }}
                    >
                      {isEnrolled ? 'Đã đăng ký' : isFull ? 'Lớp đã đầy' : 'Đăng ký'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Dialog xác nhận đăng ký */}
      <Dialog open={confirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Xác nhận đăng ký lớp học</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn đăng ký lớp <strong>{selectedClass?.name}</strong>?
          </DialogContentText>
          
          {selectedClass && (
            <Box mt={2}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">Lớp học</TableCell>
                      <TableCell>{selectedClass.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Môn học</TableCell>
                      <TableCell>{selectedClass.subject?.name || 'Không xác định'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Học phí</TableCell>
                      <TableCell>{selectedClass.fee.toLocaleString('vi-VN')} VNĐ</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Lịch học</TableCell>
                      <TableCell>{selectedClass.schedule || 'Xem chi tiết'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Sau khi đăng ký, bạn cần thanh toán học phí để hoàn tất quá trình. Liên hệ với trung tâm để biết thêm chi tiết.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Hủy</Button>
          <Button onClick={handleEnrollClass} variant="contained" color="primary">
            Xác nhận đăng ký
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog đăng ký thành công */}
      <Dialog open={successDialog} onClose={handleCloseSuccessDialog}>
        <DialogTitle>Đăng ký thành công</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" my={2}>
            <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Bạn đã đăng ký lớp học thành công!
            </Typography>
            <Typography variant="body1" align="center">
              Vui lòng liên hệ với trung tâm để thanh toán học phí và nhận tài liệu học tập.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog}>Đóng</Button>
          <Button href="/user" variant="contained" color="primary">
            Về trang chủ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClassRegistration;
