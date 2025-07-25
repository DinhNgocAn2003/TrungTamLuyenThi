import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  Button
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarMonthIcon,
  TrendingUp as TrendingUpIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  getStudentByUserId,
  getAttendance,
  getEnrollments
} from '../../services/supabase/database';

const COLORS = ['#4caf50', '#f44336', '#2196f3'];

function UserAttendance() {
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    total: 0,
    rate: 0
  });

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  useEffect(() => {
    filterAttendanceRecords();
    calculateAttendanceStats();
  }, [selectedClass, attendanceRecords]);

const fetchStudentData = async () => {
  // Early return nếu không có user
  if (!user || !user.id) {
    setStudent(null);
    setEnrollments([]);
    setAttendanceRecords([]);
    setFilteredRecords([]);
    return;
  }

  setLoading(true);
  try {
    // 1. Lấy thông tin học sinh chính
    const { data: studentData, error: studentError } = await getStudentByUserId(user.id);
    if (studentError) throw studentError;
    
    // Xử lý khi không tìm thấy học sinh
    if (!studentData) {
      setStudent(null);
      setEnrollments([]);
      setAttendanceRecords([]);
      setFilteredRecords([]);
      showNotification('Không tìm thấy hồ sơ học sinh', 'warning');
      return;
    }
    
    setStudent(studentData);

    // 2. Load song song các dữ liệu phụ
    const [
      { data: enrollmentData, error: enrollmentError },
      { data: attendanceData, error: attendanceError }
    ] = await Promise.all([
      getEnrollments(null, studentData.id),
      getAttendance(null, studentData.id)
    ]);

    // Xử lý lỗi phụ (chỉ log chứ không throw)
    if (enrollmentError) console.error('Lỗi enrollment:', enrollmentError);
    if (attendanceError) console.error('Lỗi attendance:', attendanceError);

    // 3. Chuẩn hóa dữ liệu
    const safeEnrollments = Array.isArray(enrollmentData) ? enrollmentData : [];
    const safeAttendance = Array.isArray(attendanceData) ? attendanceData : [];

    // 4. Sắp xếp điểm danh mới nhất đầu tiên
    const sortedAttendance = [...safeAttendance].sort((a, b) => {
      const dateA = a?.date ? new Date(a.date).getTime() : 0;
      const dateB = b?.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    // 5. Cập nhật state
    setEnrollments(safeEnrollments);
    setAttendanceRecords(sortedAttendance);
    setFilteredRecords(sortedAttendance);

  } catch (error) {
    console.error('Lỗi chính khi tải dữ liệu:', error);
    
    // Chỉ hiển thị thông báo cho lỗi nghiêm trọng
    if (!error.message.includes('404') && !error.message.includes('Not found')) {
      showNotification('Lỗi hệ thống khi tải dữ liệu', 'error');
    }
    
    // Reset state để tránh giao diện bị lỗi
    setStudent(null);
    setEnrollments([]);
    setAttendanceRecords([]);
    setFilteredRecords([]);
  } finally {
    setLoading(false);
  }
};

const filterAttendanceRecords = (classId) => {
  try {
    // Đảm bảo attendanceRecords luôn là mảng hợp lệ
    const records = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    
    if (!classId) {
      setFilteredRecords(records);
      return;
    }

    // Filter an toàn, xử lý cả trường hợp record không có class_id
    const filtered = records.filter(record => {
      return record && record.class_id && record.class_id.toString() === classId.toString();
    });
    
    setFilteredRecords(filtered);
  } catch (error) {
    console.error('Lỗi khi lọc điểm danh:', error);
    // Fallback về toàn bộ records nếu có lỗi
    setFilteredRecords(Array.isArray(attendanceRecords) ? attendanceRecords : []);
  }
};
  const calculateAttendanceStats = (records = null) => {
    const data = records || filteredRecords;
    
    if (!data || data.length === 0) {
      setAttendanceStats({ present: 0, absent: 0, total: 0, rate: 0 });
      return;
    }
    
    const present = data.filter(record => record.status).length;
    const absent = data.length - present;
    const rate = data.length > 0 ? (present / data.length) * 100 : 0;
    
    setAttendanceStats({
      present,
      absent,
      total: data.length,
      rate
    });
  };

  const getClassOptions = () => {
    const classMap = new Map();
    
    // Lấy thông tin lớp học từ điểm danh
    attendanceRecords.forEach(record => {
      if (record.classes && !classMap.has(record.class_id)) {
        classMap.set(record.class_id, record.classes);
      }
    });
    
    // Bổ sung thông tin từ danh sách đăng ký
    enrollments.forEach(enrollment => {
      if (enrollment.classes && !classMap.has(enrollment.class_id)) {
        classMap.set(enrollment.class_id, enrollment.classes);
      }
    });
    
    return Array.from(classMap.values());
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lịch sử điểm danh
      </Typography>
      
      <Grid container spacing={3} mb={3}>
        {/* Thống kê điểm danh */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tỷ lệ đi học
              </Typography>
              
              <Box height={200} display="flex" justifyContent="center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Có mặt', value: attendanceStats.present },
                        { name: 'Vắng mặt', value: attendanceStats.absent },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell key={`cell-0`} fill={COLORS[0]} />
                      <Cell key={`cell-1`} fill={COLORS[1]} />
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Số buổi']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tỷ lệ điểm danh
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <TrendingUpIcon color={attendanceStats.rate >= 80 ? 'success' : 'error'} sx={{ mr: 0.5 }} />
                      <Typography variant="h6" color={attendanceStats.rate >= 80 ? 'success.main' : 'error.main'}>
                        {attendanceStats.rate.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tổng số buổi
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <EventNoteIcon color="primary" sx={{ mr: 0.5 }} />
                      <Typography variant="h6">
                        {attendanceStats.total}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Thống kê chi tiết */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Thống kê điểm danh
                </Typography>
                
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Lớp học</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={handleClassChange}
                    label="Lớp học"
                  >
                    <MenuItem value="">Tất cả lớp học</MenuItem>
                    {getClassOptions().map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tổng số buổi
                    </Typography>
                    <Typography variant="h4">
                      {attendanceStats.total}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Có mặt
                    </Typography>
                    <Typography variant="h4">
                      {attendanceStats.present}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vắng mặt
                    </Typography>
                    <Typography variant="h4">
                      {attendanceStats.absent}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box mt={2}>
                {attendanceStats.absent > 0 && (
                  <Alert severity="warning">
                    <AlertTitle>Cảnh báo</AlertTitle>
                    Bạn đã vắng mặt {attendanceStats.absent} buổi học. Học sinh vắng quá nhiều có thể bị ảnh hưởng đến kết quả học tập.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Bảng lịch sử điểm danh */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lịch sử điểm danh chi tiết
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {filteredRecords.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Lớp học</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell>Ghi chú</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{dayjs(record.date).format('DD/MM/YYYY')}</TableCell>
                    <TableCell>{record.classes?.name || 'N/A'}</TableCell>
                    <TableCell align="center">
                      {record.status ? (
                        <Chip 
                          icon={<CheckIcon />} 
                          label="Có mặt" 
                          color="success" 
                          size="small"
                        />
                      ) : (
                        <Chip 
                          icon={<CloseIcon />} 
                          label="Vắng mặt" 
                          color="error" 
                          size="small"
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
            Không có dữ liệu điểm danh nào
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

export default UserAttendance;
