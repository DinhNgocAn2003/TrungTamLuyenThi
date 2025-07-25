import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';

import { 
  getClasses, 
  getClassById, 
  createClass, 
  updateClass, 
  deleteClass, 
  getEnrollments,
  getSubjects,
  getTeachers,
  assignTeacher,
  removeTeacher,
  getClassTeachers,
  addClassSchedule,
  removeClassSchedule,
  getClassSchedules
} from '../../services/supabase/database';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';

function ClassManagement() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classTeachers, setClassTeachers] = useState([]);
  const [classSchedules, setClassSchedules] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [teacherDialog, setTeacherDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subject_id: '',
    level: '',
    description: '',
    fee: 0,
    max_students: 20,
    schedule: '',
    start_date: dayjs(),
    end_date: dayjs().add(3, 'month'),
    is_active: true
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    location: ''
  });

  // Các tùy chọn ngày trong tuần
  const dayOptions = [
    { value: '1', label: 'Thứ 2' },
    { value: '2', label: 'Thứ 3' },
    { value: '3', label: 'Thứ 4' },
    { value: '4', label: 'Thứ 5' },
    { value: '5', label: 'Thứ 6' },
    { value: '6', label: 'Thứ 7' },
    { value: '0', label: 'Chủ nhật' },
  ];

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await getClasses();
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      showNotification('Lỗi khi tải danh sách lớp học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await getSubjects();
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showNotification('Lỗi khi tải danh sách môn học: ' + error.message, 'error');
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await getTeachers();
      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showNotification('Lỗi khi tải danh sách giáo viên: ' + error.message, 'error');
    }
  };

  const fetchClassDetails = async (classId) => {
    setLoading(true);
    try {
      const { data, error } = await getClassById(classId);
      if (error) throw error;
      
      setSelectedClass(data);
      
      // Lấy danh sách học sinh đã đăng ký lớp
      const { data: enrollmentData, error: enrollmentError } = await getEnrollments(classId);
      if (enrollmentError) throw enrollmentError;
      
      setEnrollments(enrollmentData || []);

      // Lấy danh sách giáo viên của lớp
      const { data: teacherData, error: teacherError } = await getClassTeachers(classId);
      if (teacherError) throw teacherError;
      
      setClassTeachers(teacherData || []);

      // Lấy lịch học của lớp
      const { data: scheduleData, error: scheduleError } = await getClassSchedules(classId);
      if (scheduleError) throw scheduleError;
      
      setClassSchedules(scheduleData || []);
      
    } catch (error) {
      console.error('Error fetching class details:', error);
      showNotification('Lỗi khi tải thông tin chi tiết lớp học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectClass = (classItem) => {
    setSelectedClass(classItem);
    fetchClassDetails(classItem.id);
  };

  const handleOpenDialog = (classItem = null) => {
    if (classItem) {
      setFormData({
        ...classItem,
        start_date: dayjs(classItem.start_date),
        end_date: dayjs(classItem.end_date)
      });
    } else {
      setFormData({
        name: '',
        subject_id: '',
        level: '',
        description: '',
        fee: 0,
        max_students: 20,
        schedule: '',
        start_date: dayjs(),
        end_date: dayjs().add(3, 'month'),
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const handleOpenTeacherDialog = () => {
    setSelectedTeacher(null);
    setTeacherDialog(true);
  };

  const handleCloseTeacherDialog = () => {
    setTeacherDialog(false);
  };

  const handleOpenScheduleDialog = () => {
    setScheduleFormData({
      day_of_week: '',
      start_time: '',
      end_time: '',
      location: ''
    });
    setScheduleDialog(true);
  };

  const handleCloseScheduleDialog = () => {
    setScheduleDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleScheduleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleFormData({
      ...scheduleFormData,
      [name]: value
    });
  };

  const handleDateChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Kiểm tra dữ liệu nhập
      if (!formData.name || !formData.subject_id || !formData.level) {
        throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      }

      const classData = {
        ...formData,
        start_date: formData.start_date.format('YYYY-MM-DD'),
        end_date: formData.end_date.format('YYYY-MM-DD'),
        fee: Number(formData.fee),
        max_students: Number(formData.max_students)
      };
      
      let result;
      
      if (formData.id) {
        // Cập nhật lớp học
        result = await updateClass(formData.id, classData);
      } else {
        // Tạo lớp học mới
        result = await createClass(classData);
      }
      
      if (result.error) throw result.error;
      
      showNotification(
        formData.id ? 'Cập nhật lớp học thành công' : 'Thêm lớp học mới thành công',
        'success'
      );
      
      handleCloseDialog();
      fetchClasses();
      
      // Nếu đang cập nhật lớp đang chọn, cập nhật thông tin
      if (selectedClass && selectedClass.id === formData.id) {
        fetchClassDetails(formData.id);
      }
      
    } catch (error) {
      console.error('Error saving class:', error);
      showNotification('Lỗi khi lưu thông tin lớp học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const { error } = await deleteClass(selectedClass.id);
      if (error) throw error;
      
      showNotification('Xóa lớp học thành công', 'success');
      setSelectedClass(null);
      handleCloseDeleteDialog();
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      showNotification('Lỗi khi xóa lớp học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!selectedClass || !selectedTeacher) {
      showNotification('Vui lòng chọn giáo viên', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await assignTeacher(selectedClass.id, selectedTeacher.id);
      if (error) throw error;
      
      showNotification('Thêm giáo viên vào lớp thành công', 'success');
      handleCloseTeacherDialog();
      fetchClassDetails(selectedClass.id);
    } catch (error) {
      console.error('Error adding teacher:', error);
      showNotification('Lỗi khi thêm giáo viên: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const { error } = await removeTeacher(selectedClass.id, teacherId);
      if (error) throw error;
      
      showNotification('Xóa giáo viên khỏi lớp thành công', 'success');
      fetchClassDetails(selectedClass.id);
    } catch (error) {
      console.error('Error removing teacher:', error);
      showNotification('Lỗi khi xóa giáo viên: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedClass) return;
    
    // Kiểm tra dữ liệu lịch học
    if (!scheduleFormData.day_of_week || !scheduleFormData.start_time || !scheduleFormData.end_time) {
      showNotification('Vui lòng nhập đầy đủ thông tin lịch học', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await addClassSchedule(selectedClass.id, scheduleFormData);
      if (error) throw error;
      
      showNotification('Thêm lịch học thành công', 'success');
      handleCloseScheduleDialog();
      fetchClassDetails(selectedClass.id);
    } catch (error) {
      console.error('Error adding schedule:', error);
      showNotification('Lỗi khi thêm lịch học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSchedule = async (scheduleId) => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const { error } = await removeClassSchedule(scheduleId);
      if (error) throw error;
      
      showNotification('Xóa lịch học thành công', 'success');
      fetchClassDetails(selectedClass.id);
    } catch (error) {
      console.error('Error removing schedule:', error);
      showNotification('Lỗi khi xóa lịch học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Tìm tên môn học từ ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Không xác định';
  };

  // Chuyển đổi mã ngày thành tên
  const getDayName = (dayCode) => {
    const day = dayOptions.find(d => d.value === dayCode);
    return day ? day.label : 'Không xác định';
  };

  return (
    <Box>
      <PageHeader 
        title="Quản lý lớp học" 
        breadcrumbs={[
          { label: 'Trang chủ', link: '/admin' },
          { label: 'Quản lý lớp học' }
        ]} 
      />
      
      <Grid container spacing={3}>
        {/* Danh sách lớp học */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Danh sách lớp học</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Thêm lớp
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <Card 
                    key={classItem.id} 
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      backgroundColor: selectedClass?.id === classItem.id ? 'primary.light' : 'background.paper',
                      color: selectedClass?.id === classItem.id ? 'primary.contrastText' : 'text.primary',
                    }}
                    onClick={() => handleSelectClass(classItem)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{classItem.name}</Typography>
                        <Box>
                          <Switch
                            size="small"
                            checked={classItem.is_active}
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Cập nhật trạng thái lớp học
                              const updatedClass = { ...classItem, is_active: !classItem.is_active };
                              updateClass(classItem.id, { is_active: !classItem.is_active })
                                .then(() => {
                                  fetchClasses();
                                  if (selectedClass?.id === classItem.id) {
                                    setSelectedClass(updatedClass);
                                  }
                                })
                                .catch(error => {
                                  showNotification('Lỗi khi cập nhật trạng thái: ' + error.message, 'error');
                                });
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Môn học: {getSubjectName(classItem.subject_id)}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Lịch học: {classItem.schedule || 'Xem chi tiết'}
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">
                          Học phí: {classItem.fee.toLocaleString('vi-VN')} VNĐ
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: classItem.is_active ? 'success.main' : 'error.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {classItem.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" py={4}>
                  Chưa có lớp học nào. Thêm lớp học mới để bắt đầu.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Chi tiết lớp học */}
        <Grid item xs={12} md={8}>
          {selectedClass ? (
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{selectedClass.name}</Typography>
                <Box>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenDialog(selectedClass)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={handleOpenDeleteDialog}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab icon={<ClassIcon />} label="Thông tin lớp" />
                  <Tab icon={<PeopleIcon />} label="Học sinh" />
                  <Tab icon={<SchoolIcon />} label="Giáo viên" />
                  <Tab icon={<CalendarMonthIcon />} label="Lịch học" />
                </Tabs>
              </Box>
              
              {/* Tab thông tin lớp */}
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>Môn học</Typography>
                    <Typography variant="body1" paragraph>
                      {getSubjectName(selectedClass.subject_id)}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>Trình độ</Typography>
                    <Typography variant="body1" paragraph>{selectedClass.level}</Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>Học phí</Typography>
                    <Typography variant="body1" paragraph>{selectedClass.fee.toLocaleString('vi-VN')} VNĐ</Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>Sĩ số tối đa</Typography>
                    <Typography variant="body1" paragraph>{selectedClass.max_students} học sinh</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>Ngày bắt đầu</Typography>
                    <Typography variant="body1" paragraph>
                      {dayjs(selectedClass.start_date).format('DD/MM/YYYY')}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>Ngày kết thúc</Typography>
                    <Typography variant="body1" paragraph>
                      {dayjs(selectedClass.end_date).format('DD/MM/YYYY')}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>Ghi chú lịch học</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedClass.schedule || 'Xem tab Lịch học'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>Trạng thái</Typography>
                    <Typography 
                      variant="body1" 
                      paragraph
                      sx={{ color: selectedClass.is_active ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                    >
                      {selectedClass.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Mô tả</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedClass.description || 'Không có mô tả'}
                    </Typography>
                  </Grid>
                </Grid>
              )}
              
              {/* Tab học sinh đã đăng ký */}
              {tabValue === 1 && (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Danh sách học sinh ({enrollments.length}/{selectedClass.max_students})
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => {/* TODO: Navigate to enrollment page */}}
                    >
                      Quản lý đăng ký
                    </Button>
                  </Box>
                  
                  {enrollments.length > 0 ? (
                    <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                      {enrollments.map((enrollment) => (
                        <Card key={enrollment.id} sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle1">
                              {enrollment.students?.full_name || 'Học sinh'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Đăng ký: {dayjs(enrollment.enrolled_at).format('DD/MM/YYYY')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Trạng thái: {enrollment.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                      Chưa có học sinh nào đăng ký lớp học này
                    </Typography>
                  )}
                </>
              )}
              
              {/* Tab giáo viên */}
              {tabValue === 2 && (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Giáo viên đứng lớp
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<PersonAddIcon />}
                      onClick={handleOpenTeacherDialog}
                    >
                      Thêm giáo viên
                    </Button>
                  </Box>
                  
                  {classTeachers.length > 0 ? (
                    <List>
                      {classTeachers.map((teacher) => (
                        <ListItem key={teacher.id} divider>
                          <ListItemAvatar>
                            <Avatar>
                              <SchoolIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={teacher.full_name}
                            secondary={`Email: ${teacher.email} - SĐT: ${teacher.phone || 'Chưa cập nhật'}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              color="error" 
                              onClick={() => handleRemoveTeacher(teacher.id)}
                            >
                              <PersonRemoveIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                      Chưa có giáo viên nào được phân công cho lớp học này
                    </Typography>
                  )}
                </>
              )}
              
              {/* Tab lịch học */}
              {tabValue === 3 && (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Lịch học chi tiết</Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenScheduleDialog}
                    >
                      Thêm lịch học
                    </Button>
                  </Box>
                  
                  {classSchedules.length > 0 ? (
                    <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                      {classSchedules.map((schedule) => (
                        <Card key={schedule.id} sx={{ mb: 2 }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                  <AccessTimeIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1">
                                    {getDayName(schedule.day_of_week)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {schedule.start_time} - {schedule.end_time}
                                  </Typography>
                                  {schedule.location && (
                                    <Typography variant="body2" color="text.secondary">
                                      Địa điểm: {schedule.location}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <IconButton 
                                color="error" 
                                onClick={() => handleRemoveSchedule(schedule.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                      Chưa có lịch học nào được thiết lập. Vui lòng thêm lịch học.
                    </Typography>
                  )}

                  <Box mt={3}>
                    <Typography variant="subtitle1" gutterBottom>Thời gian học</Typography>
                    <Typography variant="body1" paragraph>
                      Từ {dayjs(selectedClass.start_date).format('DD/MM/YYYY')} đến {dayjs(selectedClass.end_date).format('DD/MM/YYYY')}
                    </Typography>
                    
                    {selectedClass.schedule && (
                      <>
                        <Typography variant="subtitle1" gutterBottom>Ghi chú lịch học</Typography>
                        <Typography variant="body1" paragraph>
                          {selectedClass.schedule}
                        </Typography>
                      </>
                    )}
                  </Box>
                </>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ClassIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Chọn một lớp học để xem chi tiết
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hoặc thêm lớp học mới bằng nút "Thêm lớp" ở bên trái
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Dialog thêm/sửa lớp học */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {formData.id ? 'Cập nhật thông tin lớp học' : 'Thêm lớp học mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Tên lớp"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="subject-label">Môn học</InputLabel>
                <Select
                  labelId="subject-label"
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  label="Môn học"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="level-label">Trình độ</InputLabel>
                <Select
                  labelId="level-label"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  label="Trình độ"
                >
                  <MenuItem value="Cơ bản">Cơ bản</MenuItem>
                  <MenuItem value="Trung bình">Trung bình</MenuItem>
                  <MenuItem value="Nâng cao">Nâng cao</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="fee"
                label="Học phí (VNĐ)"
                fullWidth
                type="number"
                value={formData.fee}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Ngày bắt đầu"
                value={formData.start_date}
                onChange={(value) => handleDateChange('start_date', value)}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Ngày kết thúc"
                value={formData.end_date}
                onChange={(value) => handleDateChange('end_date', value)}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="schedule"
                label="Ghi chú lịch học"
                fullWidth
                value={formData.schedule}
                onChange={handleInputChange}
                margin="normal"
                placeholder="Ví dụ: Thứ 2, 4, 6 - 18:00-20:00"
                helperText="Lịch học chi tiết có thể thêm sau"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="max_students"
                label="Sĩ số tối đa"
                fullWidth
                type="number"
                value={formData.max_students}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Mô tả lớp học"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="Lớp học đang hoạt động"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {formData.id ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog thêm giáo viên */}
      <Dialog open={teacherDialog} onClose={handleCloseTeacherDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm giáo viên vào lớp</DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            options={teachers}
            getOptionLabel={(option) => `${option.full_name} (${option.email})`}
            onChange={(event, newValue) => {
              setSelectedTeacher(newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Chọn giáo viên" 
                margin="normal" 
                fullWidth 
                required
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTeacherDialog}>Hủy</Button>
          <Button onClick={handleAddTeacher} variant="contained" color="primary">
            Thêm giáo viên
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog thêm lịch học */}
      <Dialog open={scheduleDialog} onClose={handleCloseScheduleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm lịch học</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="day-label">Ngày trong tuần</InputLabel>
            <Select
              labelId="day-label"
              name="day_of_week"
              value={scheduleFormData.day_of_week}
              onChange={handleScheduleInputChange}
              label="Ngày trong tuần"
            >
              {dayOptions.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            name="start_time"
            label="Giờ bắt đầu"
            type="time"
            fullWidth
            value={scheduleFormData.start_time}
            onChange={handleScheduleInputChange}
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 phút
            }}
          />
          
          <TextField
            name="end_time"
            label="Giờ kết thúc"
            type="time"
            fullWidth
            value={scheduleFormData.end_time}
            onChange={handleScheduleInputChange}
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 phút
            }}
          />
          
          <TextField
            name="location"
            label="Địa điểm"
            fullWidth
            value={scheduleFormData.location}
            onChange={handleScheduleInputChange}
            margin="normal"
            placeholder="Ví dụ: Phòng 101, Tầng 1"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseScheduleDialog}>Hủy</Button>
          <Button onClick={handleAddSchedule} variant="contained" color="primary">
            Thêm lịch học
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa lớp học</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa lớp học "{selectedClass?.name}"? 
            Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteClass} color="error" variant="contained">
            Xóa lớp học
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClassManagement;
