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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Autocomplete,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';

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
import { setClassTeachers, addTeachersToClass } from '../../services/supabase/classes';
import { getSubjectGradeCombinations, getTeachersForSubjectGrade } from '../../services/supabase/teacherAssignments';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';

function ClassManagement() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectGrades, setSubjectGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  // classTeachers: danh sách giáo viên của lớp; setClassTeachersState tránh trùng tên hàm service setClassTeachers
  const [classTeachers, setClassTeachersState] = useState([]);
  const [classSchedules, setClassSchedules] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
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
    subjects_grades_id: null,
    description: '',
    fee: 0,
  is_active: true,
  isPublic: true
  });
  const [selectedSubjectGrade, setSelectedSubjectGrade] = useState(null);

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
    fetchSubjectGrades();
  }, []);

  const fetchSubjectGrades = async () => {
    try {
      const { data, error } = await getSubjectGradeCombinations();
      if (error) throw error;
      setSubjectGrades(data || []);
    } catch (err) {
      console.error('Error fetching subjects_grades:', err);
      setSubjectGrades([]);
    }
  };

  const fetchTeachersForSubjectGrade = async (subjectGradeId) => {
    try {
      if (!subjectGradeId) {
        setFilteredTeachers([]);
        return;
      }
      const { data, error } = await getTeachersForSubjectGrade(subjectGradeId);
      if (error) throw error;
      setFilteredTeachers(data || []);
    } catch (err) {
      console.error('Error fetching teachers for subjectGrade:', err);
      setFilteredTeachers([]);
    }
  };

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
      
  setClassTeachersState(teacherData || []);

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
      // Chỉ lấy các field hợp lệ của bảng classes tránh đưa object subjects_grades gây lỗi
      setFormData(prev => ({
        id: classItem.id,
        name: classItem.name || '',
        subjects_grades_id: classItem.subjects_grades_id || null,
        description: classItem.description || '',
        fee: classItem.fee ?? 0,
  is_active: classItem.is_active !== undefined ? classItem.is_active : true,
  // accept either isPublic or isPublic from API
  isPublic: classItem.isPublic !== undefined ? classItem.isPublic : (classItem.isPublic !== undefined ? classItem.isPublic : true)
      }));
      // preload selected teachers for editing (normalize to assignment objects)
      (async () => {
        try {
          const { data: teacherData } = await getClassTeachers(classItem.id);
          const normalized = (teacherData || []).map(t => ({
            id: t.teacher_id || t.id,
            teacher_id: t.teacher_id || t.id,
            full_name: t.full_name || t.name || '',
            email: t.email,
            phone: t.phone,
          })).filter(x => x.id != null);
          setSelectedTeachers(normalized);
        } catch (err) {
          console.error('Error loading teachers:', err);
          setSelectedTeachers([]);
        }
      })();
      // preload selected subjects_grades if available
      if (classItem.subjects_grades_id) {
        const match = subjectGrades.find(sg => sg.id === classItem.subjects_grades_id);
        if (match) {
          setSelectedSubjectGrade(match);
          setFormData(prev => ({ ...prev, subjects_grades_id: match.id }));
          fetchTeachersForSubjectGrade(match.id);
        }
      }
    } else {
      setFormData({
        name: '',
        subjects_grades_id: null,
        description: '',
        fee: 0,
  is_active: true,
  isPublic: true
      });
      setSelectedTeachers([]);
      setSelectedSubjectGrade(null);
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Kiểm tra dữ liệu nhập
      if (!formData.name || !formData.subjects_grades_id) {
        throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc (Tên lớp và Lớp học)");
      }
  // Lưu ý: selectedTeachers chứa danh sách object giáo viên được chọn (có field id)
      // Chỉ whitelist các cột thật của bảng để tránh gửi subjects_grades gây PGRST204
  const allowed = ['name','subjects_grades_id','description','fee','is_active'];
      const classData = {};
      allowed.forEach(k => {
        if (Object.prototype.hasOwnProperty.call(formData, k)) {
          classData[k] = formData[k];
        }
      });
  classData.fee = Number(classData.fee) || 0;
  // map camelCase -> snake_case expected by DB
  classData.isPublic = formData.isPublic;
      
      let result;
      let classId;
      
  const isUpdate = !!formData.id;
      if (isUpdate) {
        result = await updateClass(formData.id, classData);
        if (result.error) throw result.error;
        classId = formData.id;
      } else {
        result = await createClass(classData);
        if (result.error) throw result.error;
        if (result.data && result.data.length > 0) classId = result.data[0].id;
        else if (result.data && result.data.id) classId = result.data.id;
        else throw new Error('Không thể lấy ID lớp học mới tạo');
      }
      // GÁN GIÁO VIÊN SAU KHI LỚP ĐÃ ĐƯỢC TẠO/CẬP NHẬT
  if (classId && selectedTeachers.length > 0) {
        try {
          // Lọc ra các teacher_id hợp lệ
          const teacherIds = selectedTeachers
            .map(teacher => {
              const derived = teacher.id || teacher.user_id || null;
              return derived;
            })
            .filter(id => id !== null && id !== undefined);
            console.log('teacherIds',teacherIds);
          if (teacherIds.length > 0) {
    // Nếu là tạo mới: chỉ thêm các giáo viên (không xóa gì vì chưa có)
    // Nếu là cập nhật: replace-all hiện tại
    const { error: assignError } = isUpdate
      ? await setClassTeachers(classId, teacherIds)
      : await addTeachersToClass(classId, teacherIds);
            if (assignError) {
              console.warn('Lỗi khi gán giáo viên:', assignError);
              showNotification('Lớp đã được tạo nhưng có lỗi khi gán giáo viên: ' + assignError.message, 'warning');
            }

            // Fetch lại để xác nhận
            try {
              const { data: refreshedTeachers, error: refErr } = await getClassTeachers(classId);
              if (refErr) {
                console.warn('[TeacherFlow] Error when refreshing class teachers:', refErr);
              } else {
                setClassTeachersState(refreshedTeachers || []);
              }
            } catch (refCatch) {
              console.warn('[TeacherFlow] Exception refreshing teachers:', refCatch);
            }
          }
        } catch (teacherError) {
          console.warn('Lỗi khi xử lý giáo viên:', teacherError);
          showNotification('Lớp đã được tạo nhưng có lỗi khi gán giáo viên: ' + teacherError.message, 'warning');
        }
      }
      
      showNotification(
        formData.id ? 'Cập nhật lớp học thành công' : 'Thêm lớp học mới thành công',
        'success'
      );
      
      handleCloseDialog();
      fetchClasses();
      
      // Nếu đang cập nhật lớp đang chọn, cập nhật thông tin
      if (selectedClass && selectedClass.id === classId) {
        fetchClassDetails(classId);
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
      const { error } = await assignTeacher(selectedClass.id, selectedTeacher.user_id || selectedTeacher.teacher_user_id || selectedTeacher.id);
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
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
                        <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>{classItem.name}</Typography>
                        <Box sx={{ mt: { xs: 1, sm: 0 } }}>
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

                      <Box sx={{ mt: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          Môn/Lớp: {subjectGrades.find(sg => sg.id === classItem.subjects_grades_id)?.display_name || 'Không xác định'}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
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
                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                          {/* Toggle công khai */}
                          <IconButton
                            size="small"
                            color={(classItem.isPublic ?? classItem.isPublic) ? 'success' : 'default'}
                            onClick={(e)=>{
                              e.stopPropagation();
                              const current = (classItem.isPublic ?? classItem.isPublic) === true;
                              updateClass(classItem.id, { isPublic: !current })
                                .then(()=>{
                                  fetchClasses();
                                  if(selectedClass?.id===classItem.id){
                                    setSelectedClass({ ...classItem, isPublic: !current });
                                  }
                                })
                                .catch(err=>showNotification('Lỗi khi cập nhật hiển thị: '+err.message,'error'));
                            }}
                            title={(classItem.isPublic ?? classItem.isPublic) ? 'Đang công khai (bấm để ẩn)' : 'Đang ẩn (bấm để công khai)'}
                          >
                            {(classItem.isPublic ?? classItem.isPublic) ? <PublicIcon fontSize="inherit" /> : <PublicOffIcon fontSize="inherit" />}
                          </IconButton>
                        </Box>
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
                    <Typography variant="subtitle1" gutterBottom>Môn / Lớp</Typography>
                    <Typography variant="body1" paragraph>
                      {subjectGrades.find(sg => sg.id === selectedClass.subjects_grades_id)?.display_name || 'Không xác định'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>Học phí</Typography>
                    <Typography variant="body1" paragraph>{selectedClass.fee.toLocaleString('vi-VN')} VNĐ</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>                    
                    <Typography variant="subtitle1" gutterBottom>Trạng thái</Typography>
                    <Typography 
                      variant="body1" 
                      paragraph
                      sx={{ color: selectedClass.is_active ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                    >
                      {selectedClass.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>Hiển thị</Typography>
                    <Typography variant="body1" paragraph>
                      {(selectedClass.isPublic ?? selectedClass.isPublic) ? 'Công khai cho học sinh đăng ký' : 'Không hiển thị trong danh sách đăng ký'}
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
                      Danh sách học sinh ({enrollments.length})
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
                              Đăng ký: {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
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
                      Giáo viên đứng lớp ({classTeachers.length})
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
                            secondary={`Email: ${teacher.email??'Chưa cập nhật'} - SĐT: ${teacher.phone ?? 'Chưa cập nhật'}`}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={isSmallScreen}>
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
            
            <Grid item xs={12}>
              <Autocomplete
                options={subjectGrades}
                getOptionLabel={(option) => option.display_name || option.name || ''}
                value={selectedSubjectGrade}
                onChange={(e, newVal) => {
                  setSelectedSubjectGrade(newVal);
                  if (newVal) {
                    setFormData({ ...formData, subjects_grades_id: newVal.id });
                    fetchTeachersForSubjectGrade(newVal.id);
                  } else {
                    setFormData({ ...formData, subjects_grades_id: null });
                    setFilteredTeachers([]);
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Lớp học" margin="normal" required />}
              />
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
              <Autocomplete
                multiple
                options={filteredTeachers.length > 0 ? filteredTeachers : []}
                getOptionLabel={(option) => option.full_name || option.email}
                value={selectedTeachers}
                onChange={(e, newValue) => setSelectedTeachers(newValue)}
                disabled={!selectedSubjectGrade}
                renderInput={(params) => (
                  <TextField {...params} label={selectedSubjectGrade ? "Giáo viên (chọn nhiều)" : "Chọn Lớp học trước"} margin="normal" fullWidth />
                )}
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
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    color="secondary"
                  />
                }
                label="Lớp học công khai (hiển thị cho học sinh đăng ký)"
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
      <Dialog open={teacherDialog} onClose={handleCloseTeacherDialog} maxWidth="sm" fullWidth fullScreen={isSmallScreen}>
        <DialogTitle>Thêm giáo viên vào lớp</DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            options={teachers}
            getOptionLabel={(option) => `${option.full_name} (${option.email || 'Chưa cập nhật'})`}
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
      <Dialog open={scheduleDialog} onClose={handleCloseScheduleDialog} maxWidth="sm" fullWidth fullScreen={isSmallScreen}>
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