import { useState, useEffect } from 'react';
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
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogContentText,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  School as SchoolIcon
} from '@mui/icons-material';

import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} from '../../services/supabase/database';
import PageHeader from '../../components/common/PageHeader';

function SubjectManagement() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  useEffect(() => {
    fetchSubjects();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subjects]);
  
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSubjects();
      if (error) throw error;
      
      setSubjects(data || []);
      setFilteredSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showNotification('Lỗi khi tải danh sách môn học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (subject = null) => {
    if (subject) {
      setFormData({
        name: subject.name,
        description: subject.description || ''
      });
      setSelectedSubject(subject);
    } else {
      setFormData({
        name: '',
        description: ''
      });
      setSelectedSubject(null);
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showNotification('Vui lòng nhập tên môn học', 'error');
      return;
    }
    
    setLoading(true);
    try {
      let result;
      
      if (selectedSubject) {
        // Cập nhật môn học
        result = await updateSubject(selectedSubject.id, formData);
      } else {
        // Tạo môn học mới
        result = await createSubject(formData);
      }
      
      if (result.error) throw result.error;
      
      showNotification(
        selectedSubject ? 'Cập nhật môn học thành công' : 'Thêm môn học mới thành công',
        'success'
      );
      
      handleCloseDialog();
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      showNotification('Lỗi khi lưu môn học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    try {
      const { error } = await deleteSubject(selectedSubject.id);
      if (error) throw error;
      
      showNotification('Xóa môn học thành công', 'success');
      setDeleteDialog(false);
      setSelectedSubject(null);
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      showNotification('Lỗi khi xóa môn học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDeleteDialog = (subject) => {
    setSelectedSubject(subject);
    setDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedSubject(null);
  };

  return (
    <Box>
      <PageHeader
        title="Quản lý môn học"
        breadcrumbs={[
          { label: 'Trang chủ', link: '/admin' },
          { label: 'Quản lý môn học' }
        ]}
      />
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          placeholder="Tìm kiếm môn học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: '500px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm môn học
        </Button>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Danh sách môn học ({filteredSubjects.length})
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên môn học</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <SchoolIcon color="primary" sx={{ mr: 1 }} />
                        {subject.name}
                      </Box>
                    </TableCell>
                    <TableCell>{subject.description || 'Không có mô tả'}</TableCell>
                    <TableCell>
                      {new Date(subject.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(subject)}
                        title="Sửa môn học"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(subject)}
                        title="Xóa môn học"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>
                      {searchTerm ? 'Không tìm thấy môn học nào' : 'Chưa có môn học nào. Thêm môn học mới để bắt đầu.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Dialog thêm/sửa môn học */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSubject ? 'Cập nhật môn học' : 'Thêm môn học mới'}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            name="name"
            label="Tên môn học"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            margin="normal"
            required
            autoFocus
          />
          
          <TextField
            name="description"
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedSubject ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa môn học</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa môn học "{selectedSubject?.name}"?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteSubject} color="error" variant="contained">
            Xóa môn học
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SubjectManagement;
