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
  Grid, 
  IconButton, 
  Paper, 
  Tab, 
  Tabs, 
  TextField, 
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

import { 
  getTeachers, 
  createTeacher, 
  updateTeacher, 
  deleteTeacher,
  getSubjects,
  getClasses,
  createUser,
  updateUserProfile
} from '../../services/supabase/database';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';

function TeacherManagement() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  const fileInputRef = useRef(null);
  
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [teacherClasses, setTeacherClasses] = useState([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    specialization: '',
    experience_years: 0,
    notes: ''
  });

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(teacher => 
        teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (teacher.phone && teacher.phone.includes(searchTerm)) ||
        (teacher.specialization && teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTeachers(filtered);
    }
  }, [searchTerm, teachers]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await getTeachers();
      if (error) throw error;
      
      setTeachers(data || []);
      setFilteredTeachers(data || []);
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
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showNotification('Lỗi khi tải danh sách môn học: ' + error.message, 'error');
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await getClasses();
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      showNotification('Lỗi khi tải danh sách lớp học: ' + error.message, 'error');
    }
  };

  const fetchTeacherDetails = async (teacherId) => {
    setLoading(true);
    try {
      // Get classes taught by teacher - this would need a proper API endpoint
      // For now, we'll filter classes where teacher is assigned
      setTeacherClasses([]);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      showNotification('Lỗi khi tải thông tin chi tiết giáo viên: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    fetchTeacherDetails(teacher.id);
  };

  const handleOpenDialog = (teacher = null) => {
    if (teacher) {
      setIsEditMode(true);
      setFormData({
        full_name: teacher.full_name || '',
        phone: teacher.phone || '',
        email: teacher.email || '',
        address: teacher.address || '',
        specialization: teacher.specialization || '',
        experience_years: teacher.experience_years || 0,
        notes: teacher.notes || ''
      });
    } else {
      setIsEditMode(false);
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        address: '',
        specialization: '',
        experience_years: 0,
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditMode(false);
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      address: '',
      specialization: '',
      experience_years: 0,
      notes: ''
    });
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.email) {
      showNotification('Vui lòng nhập họ tên và email giáo viên', 'error');
      return;
    }   
    
    setLoading(true);
    try {
      const teacherData = {
        ...formData,
        experience_years: Number(formData.experience_years) || 0
      };
      
      let result;
      
      if (isEditMode && selectedTeacher) {
        // Update teacher
        result = await updateTeacher(selectedTeacher.id, teacherData);
        if (result.error) throw result.error;
        
        showNotification('Cập nhật thông tin giáo viên thành công', 'success');
        
        // Update selected teacher
        const updatedTeacher = { ...selectedTeacher, ...teacherData };
        setSelectedTeacher(updatedTeacher);
        
        // Update teachers list
        setTeachers(prevTeachers => 
          prevTeachers.map(teacher => 
            teacher.id === selectedTeacher.id ? updatedTeacher : teacher
          )
        );
        
        // Update filtered teachers
        setFilteredTeachers(prevFiltered => 
          prevFiltered.map(teacher => 
            teacher.id === selectedTeacher.id ? updatedTeacher : teacher
          )
        );
      } else {
        // Create new teacher
        result = await createTeacher(teacherData);
        if (result.error) throw result.error;
        
        showNotification('Thêm giáo viên mới thành công', 'success');
        fetchTeachers();
      }
      
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error saving teacher:', error);
      showNotification('Lỗi khi lưu thông tin giáo viên: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    
    setLoading(true);
    try {
      const { error } = await deleteTeacher(selectedTeacher.id);
      if (error) throw error;
      
      showNotification('Xóa giáo viên thành công', 'success');
      setSelectedTeacher(null);
      handleCloseDeleteDialog();
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      showNotification('Lỗi khi xóa giáo viên: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTeachers = () => {
    try {
      const wb = XLSX.utils.book_new();
      const headers = ['Họ và tên', 'Điện thoại', 'Email', 'Địa chỉ', 'Chuyên môn', 'Kinh nghiệm (năm)', 'Ghi chú'];
      
      const data = [headers];
      
      teachers.forEach(teacher => {
        const row = [
          teacher.full_name,
          teacher.phone || '',
          teacher.email || '',
          teacher.address || '',
          teacher.specialization || '',
          teacher.experience_years || 0,
          teacher.notes || ''
        ];
        data.push(row);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Giáo viên');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      FileSaver.saveAs(blob, `danh_sach_giao_vien_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showNotification('Đã xuất danh sách giáo viên', 'success');
    } catch (error) {
      console.error('Error exporting teachers:', error);
      showNotification('Lỗi khi xuất danh sách giáo viên: ' + error.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader 
        title="Quản lý giáo viên" 
        breadcrumbs={[
          { label: 'Trang chủ', link: '/admin' },
          { label: 'Quản lý giáo viên' }
        ]} 
      />
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          placeholder="Tìm kiếm giáo viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: '500px', border: '1px solid white', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportTeachers}
            sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Xuất Excel
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm giáo viên
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Danh sách giáo viên */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Danh sách giáo viên ({filteredTeachers.length})
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <Card 
                    key={teacher.id} 
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      backgroundColor: selectedTeacher?.id === teacher.id ? 'primary.light' : 'background.paper',
                      color: selectedTeacher?.id === teacher.id ? 'primary.contrastText' : 'text.primary',
                    }}
                    onClick={() => handleSelectTeacher(teacher)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar sx={{ mr: 2, bgcolor: selectedTeacher?.id === teacher.id ? 'primary.dark' : 'primary.main' }}>
                          {teacher.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h6">{teacher.full_name}</Typography>
                      </Box>
                      
                      {teacher.specialization && (
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <SchoolIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">{teacher.specialization}</Typography>
                        </Box>
                      )}
                      
                      {teacher.phone && (
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">{teacher.phone}</Typography>
                        </Box>
                      )}
                      
                      {teacher.email && (
                        <Box display="flex" alignItems="center">
                          <EmailIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">{teacher.email}</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" py={4}>
                  {searchTerm ? 'Không tìm thấy giáo viên nào' : 'Chưa có giáo viên nào. Thêm giáo viên mới để bắt đầu.'}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Chi tiết giáo viên */}
        <Grid item xs={12} md={7} lg={8}>
          {selectedTeacher ? (
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{selectedTeacher.full_name}</Typography>
                <Box>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenDialog(selectedTeacher)}
                    sx={{ mr: 1 }}
                    title="Sửa thông tin"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={handleOpenDeleteDialog}
                    title="Xóa giáo viên"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Thông tin cá nhân" />
                  <Tab label="Lớp phụ trách" />
                </Tabs>
              </Box>
              
              {/* Tab thông tin cá nhân */}
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Chuyên môn</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedTeacher.specialization || 'Chưa cập nhật'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Kinh nghiệm</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedTeacher.experience_years ? `${selectedTeacher.experience_years} năm` : 'Chưa cập nhật'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Số điện thoại</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedTeacher.phone || 'Chưa cập nhật'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Email</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedTeacher.email || 'Chưa cập nhật'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Địa chỉ</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedTeacher.address || 'Chưa cập nhật'}
                    </Typography>
                  </Grid>
                  
                  {selectedTeacher.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Ghi chú</Typography>
                      <Typography variant="body1" paragraph>
                        {selectedTeacher.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
              
              {/* Tab lớp phụ trách */}
              {tabValue === 1 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Các lớp phụ trách ({teacherClasses.length})
                  </Typography>
                  
                  {teacherClasses.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Lớp học</TableCell>
                            <TableCell>Môn học</TableCell>
                            <TableCell>Số học sinh</TableCell>
                            <TableCell>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {teacherClasses.map((classItem) => (
                            <TableRow key={classItem.id}>
                              <TableCell>{classItem.name}</TableCell>
                              <TableCell>{classItem.subject_name}</TableCell>
                              <TableCell>{classItem.current_students || 0}/{classItem.max_students}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={classItem.status === 'active' ? 'Đang hoạt động' : 'Đã dừng'}
                                  color={classItem.status === 'active' ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                      Giáo viên chưa được phân công lớp nào
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Chọn một giáo viên để xem chi tiết
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hoặc thêm giáo viên mới bằng nút "Thêm giáo viên" ở trên
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
      
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
                margin="normal"
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
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Chuyên môn</InputLabel>
                <Select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  label="Chuyên môn"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="Khác">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="experience_years"
                label="Số năm kinh nghiệm"
                fullWidth
                type="number"
                value={formData.experience_years}
                onChange={handleInputChange}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="address"
                label="Địa chỉ"
                fullWidth
                value={formData.address}
                onChange={handleInputChange}
                margin="normal"
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
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa giáo viên</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa giáo viên "{selectedTeacher?.full_name}"? 
            Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteTeacher} color="error" variant="contained">
            Xóa giáo viên
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeacherManagement;
