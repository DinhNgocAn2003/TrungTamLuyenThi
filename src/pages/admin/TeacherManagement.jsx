import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  TablePagination,
  Collapse,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PersonAdd as PersonAddIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { 
  getTeachers, 
  createTeacher, 
  updateTeacher, 
  deleteTeacher,
  getSubjects,
  getClasses
} from '../../services/supabase/database';
import { getSubjectGradeCombinations, saveTeacherAssignments, getTeacherSubjectGrades } from '../../services/supabase/teacherAssignments';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';

const TeacherManagement = () => {
  const { showNotification } = useNotification();
  const { setLoading } = useLoading();

  // State variables
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [subjectsGrades, setSubjectsGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSpecializationIds, setSelectedSpecializationIds] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    specialization: '',
    year_graduation: '',
    university: '',
    notes: ''
  });

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Fetch data on component mount
  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchClasses();
    fetchSubjectsGrades();
  }, []);

  // Filter teachers based on search
  useEffect(() => {
    const filtered = teachers.filter(teacher =>
      teacher.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.phone?.includes(searchQuery) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [teachers, searchQuery]);

  // Fetch functions
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await getTeachers();
      if (error) {
        console.error('Error fetching teachers:', error);
        showNotification('Lỗi khi tải danh sách giáo viên: ' + error.message, 'error');
      } else {
        setTeachers(data || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showNotification('Lỗi khi tải danh sách giáo viên: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await getSubjects();
      if (error) {
        console.error('Error fetching subjects:', error);
        showNotification('Lỗi khi tải danh sách môn học: ' + error.message, 'error');
      } else {
        setSubjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showNotification('Lỗi khi tải danh sách môn học: ' + error.message, 'error');
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await getClasses();
      if (error) {
        console.error('Error fetching classes:', error);
        showNotification('Lỗi khi tải danh sách lớp học: ' + error.message, 'error');
      } else {
        setClasses(data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showNotification('Lỗi khi tải danh sách lớp học: ' + error.message, 'error');
    }
  };

  const fetchSubjectsGrades = async () => {
    try {
      const { data, error } = await getSubjectGradeCombinations();
      if (error) {
        console.error('Error fetching subjects grades:', error);
        showNotification('Lỗi khi tải danh sách môn học-lớp: ' + error.message, 'error');
      } else {
        setSubjectsGrades(data || []);
      }
    } catch (error) {
      console.error('Error fetching subjects grades:', error);
      showNotification('Lỗi khi tải danh sách môn học-lớp: ' + error.message, 'error');
    }
  };

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? value : value
    }));
  };

  const handleOpenDialog = async (teacher = null) => {
    if (teacher) {
      setIsEditMode(true);
      setFormData({
        full_name: teacher.full_name || '',
        phone: teacher.phone || '',
        email: teacher.email || '',
        address: teacher.address || '',
        specialization: teacher.specialization || '',
        year_graduation: teacher.year_graduation || '',
        university: teacher.university || '',
        notes: teacher.notes || ''
      });
      setSelectedTeacher(teacher);
      
      // Load teacher's current specializations
      if (teacher.user_id) {
        try {
          const { data: teacherSpecializations } = await getTeacherSubjectGrades(teacher.user_id);
          if (teacherSpecializations) {
            const specializationIds = teacherSpecializations.map(ts => ts.subjects_grades_id);
            setSelectedSpecializationIds(specializationIds);
          }
        } catch (error) {
          console.error('Error loading teacher specializations:', error);
        }
      }
    } else {
      setIsEditMode(false);
      setSelectedSpecializationIds([]);
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        address: '',
        specialization: '',
        year_graduation: '',
        university: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeacher(null);
    setIsEditMode(false);
    setSelectedSpecializationIds([]);
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      address: '',
      specialization: '',
      year_graduation: '',
      university: '',
      notes: ''
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.full_name.trim()) {
        showNotification('Vui lòng nhập họ tên', 'error');
        return;
      }
      if (!formData.phone.trim()) {
        showNotification('Vui lòng nhập số điện thoại', 'error');
        return;
      }

      setLoading(true);

      const teacherData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        specialization: formData.specialization,
        year_graduation: formData.year_graduation || null,
        university: formData.university.trim(),
        notes: formData.notes.trim()
      };

      let result;
      if (isEditMode) {
        result = await updateTeacher(selectedTeacher.id, teacherData);
        
        // Lưu specializations cho giáo viên đã có
        if (result.data && selectedSpecializationIds.length > 0) {
          const assignmentResult = await saveTeacherAssignments(selectedTeacher.user_id, selectedSpecializationIds);
          if (assignmentResult.error) {
            console.error('Error saving teacher assignments:', assignmentResult.error);
            showNotification('Cập nhật giáo viên thành công nhưng có lỗi khi lưu chuyên môn', 'warning');
          }
        }
      } else {
        result = await createTeacher(teacherData);
        
        // Lưu specializations cho giáo viên mới
        if (result.data && selectedSpecializationIds.length > 0) {
          const assignmentResult = await saveTeacherAssignments(result.data.user_id, selectedSpecializationIds);
          if (assignmentResult.error) {
            console.error('Error saving teacher assignments:', assignmentResult.error);
            showNotification('Thêm giáo viên thành công nhưng có lỗi khi lưu chuyên môn', 'warning');
          }
        }
      }

      if (result.error) {
        showNotification(
          `Lỗi khi ${isEditMode ? 'cập nhật' : 'thêm'} giáo viên: ${result.error.message}`,
          'error'
        );
        return;
      }

      showNotification(
        `${isEditMode ? 'Cập nhật' : 'Thêm'} giáo viên thành công!`,
        'success'
      );
      
      handleCloseDialog();
      fetchTeachers();
    } catch (error) {
      console.error('Error submitting teacher:', error);
      showNotification(`Lỗi khi ${isEditMode ? 'cập nhật' : 'thêm'} giáo viên: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const { error } = await deleteTeacher(selectedTeacher.id);
      if (error) {
        showNotification('Lỗi khi xóa giáo viên: ' + error.message, 'error');
      } else {
        showNotification('Xóa giáo viên thành công!', 'success');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      showNotification('Lỗi khi xóa giáo viên: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
      setSelectedTeacher(null);
    }
  };

  const handleRowExpand = (teacherId) => {
    setExpandedRows(prev => ({
      ...prev,
      [teacherId]: !prev[teacherId]
    }));
  };

  const handleExport = () => {
    const csvContent = [
      ['Họ tên', 'Số điện thoại', 'Email', 'Địa chỉ', 'Chuyên môn', 'Năm tốt nghiệp', 'Trường đại học', 'Ghi chú'],
      ...filteredTeachers.map(teacher => [
        teacher.full_name,
        teacher.phone,
        teacher.email,
        teacher.address,
        teacher.specialization,
        teacher.year_graduation || '',
        teacher.university || '',
        teacher.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'danh_sach_giao_vien.csv';
    link.click();
  };

  // Tạo danh sách các option chuyên môn từ subjects_grades
  const getSpecializationOptions = () => {
    const options = subjectsGrades.map(sg => ({
      id: sg.id,
      label: sg.name || sg.display_name || `${sg.subject_name} - Lớp ${sg.grade_name}`,
      value: sg.id
    }));
    return options;
  };

  // Calculate stats
  const stats = [
    {
      title: 'Tổng số giáo viên',
      value: teachers.length,
      icon: <PersonAddIcon />,
      color: 'primary'
    },
    {
      title: 'Số môn học',
      value: subjects.length,
      icon: <SchoolIcon />,
      color: 'info'
    },
    {
      title: 'Tổ hợp môn-lớp',
      value: subjectsGrades.length,
      icon: <SchoolIcon />,
      color: 'success'
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Quản lý Giáo viên"
        subtitle="Quản lý thông tin giáo viên và phân công giảng dạy"
      />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Card */}
      <Card>
        <CardContent>
          {/* Toolbar */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                placeholder="Tìm kiếm giáo viên..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
            </Box>
            
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
              >
                Xuất Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Thêm giáo viên
              </Button>
            </Box>
          </Box>

          {/* Data Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell><strong>Họ tên</strong></TableCell>
                  <TableCell><strong>Số điện thoại</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Chuyên môn</strong></TableCell>
                  <TableCell align="center"><strong>Thao tác</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTeachers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((teacher) => (
                    <React.Fragment key={teacher.user_id}>
                      <TableRow hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleRowExpand(teacher.user_id)}
                          >
                            {expandedRows[teacher.user_id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {teacher.full_name}
                          </Typography>
                        </TableCell>
                        <TableCell>{teacher.phone}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>
                          {teacher.specialization ? (
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {teacher.specialization.split(', ').slice(0, 2).map((spec, index) => (
                                <Chip 
                                   key={`${teacher.user_id}-spec-${index}`}
                                  label={spec} 
                                  size="small" 
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                              {teacher.specialization.split(', ').length > 2 && (
                                <Chip 
                                  key={`${teacher.user_id}-detail-spec-${index}`}  // Thêm key unique
                                  label={`+${teacher.specialization.split(', ').length - 2}`}
                                  size="small" 
                                  color="default"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          ) : (
                            <Chip 
                              label="Chưa cập nhật" 
                              size="small" 
                              color="default"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <Tooltip title="Xem chi tiết">
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleRowExpand(teacher.user_id)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => {
                                  setSelectedTeacher(teacher);
                                  handleOpenDialog(teacher);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => {
                                  setSelectedTeacher(teacher);
                                  setOpenDeleteDialog(true);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      <TableRow>
                        <TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
                          <Collapse in={expandedRows[teacher.user_id]} timeout="auto" unmountOnExit>
                            <Box margin={2}>
                              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                                <Tab label="Thông tin chi tiết" />
                              </Tabs>
                              
                              {tabValue === 0 && (
                                <Box sx={{ p: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                      <Typography><strong>Địa chỉ:</strong> {teacher.address || 'Chưa cập nhật'}</Typography>
                                      <Typography><strong>Năm tốt nghiệp:</strong> {teacher.year_graduation || 'Chưa cập nhật'}</Typography>
                                      <Typography><strong>Trường đại học:</strong> {teacher.university || 'Chưa cập nhật'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Typography><strong>Ghi chú:</strong> {teacher.notes || 'Không có'}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        <strong>Chuyên môn:</strong>
                                      </Typography>
                                      {teacher.specialization ? (
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                          {teacher.specialization.split(', ').map((spec, index) => (
                                            <Chip 
                                              key={`${teacher.user_id}-detail-spec-${index}`}  // Thêm key unique
                                              label={spec} 
                                              size="small" 
                                              color="primary"
                                              variant="outlined"
                                              icon={<SchoolIcon />}
                                            />
                                          ))}
                                        </Box>
                                      ) : (
                                        <Typography color="text.secondary">Chưa cập nhật chuyên môn</Typography>
                                      )}
                                    </Grid>
                                  </Grid>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredTeachers.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong tổng số ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog thêm/sửa giáo viên */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Cập nhật thông tin giáo viên' : 'Thêm giáo viên mới'}
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
                // margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Số điện thoại"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                // margin="normal"
                required
                // helperText="Trường này là bắt buộc"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                // margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                name="specialization"
                options={getSpecializationOptions()}
                value={getSpecializationOptions().filter(option => selectedSpecializationIds.includes(option.id))}
                onChange={(event, newValue) => {
                  const newIds = newValue.map(option => option.id);
                  setSelectedSpecializationIds(newIds);
                  
                  // Update formData for backward compatibility
                  setFormData(prev => ({
                    ...prev,
                    specialization: newValue.map(option => option.label).join(', ')
                  }));
                }}
                getOptionLabel={(option) => option.label || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        variant="outlined"
                        label={option.label}
                        {...tagProps}
                        size="small"
                        color="primary"
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chuyên môn"
                    placeholder="Chọn các chuyên môn"
                    // margin="normal"
                    // helperText="Có thể chọn nhiều chuyên môn. VD: Toán 6, Vật lý 7"
                  />
                )}
                sx={{ mt: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="address"
                label="Địa chỉ"
                fullWidth
                value={formData.address}
                onChange={handleInputChange}
                // margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="year_graduation"
                label="Năm tốt nghiệp"
                fullWidth
                type="number"
                value={formData.year_graduation}
                onChange={handleInputChange}
                // margin="normal"
                inputProps={{ min: 1950, max: new Date().getFullYear() }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="university"
                label="Trường đại học"
                fullWidth
                value={formData.university}
                onChange={handleInputChange}
                // margin="normal"
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
                // margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa giáo viên "{selectedTeacher?.full_name}"? 
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherManagement;
