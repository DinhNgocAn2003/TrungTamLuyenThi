import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/supabase/database';

function StudentManagement() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    full_name: '',
    date_of_birth: null,
    gender: '',
    address: '',
    phone: '',
    email: '',
    parent_name: '',
    parent_phone: '',
    parent_zalo: '',
    school: '',
    notes: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // apply search, filters and sort
    let result = Array.isArray(students) ? [...students] : [];

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(student =>
        (student.full_name || '').toLowerCase().includes(q) ||
        (student.email || '').toLowerCase().includes(q) ||
        (student.phone || '').includes(q)
      );
    }

    if (filterSchool) {
      result = result.filter(s => (s.school || '') === filterSchool);
    }

    if (filterGender) {
      result = result.filter(s => (s.gender || '') === filterGender);
    }



    setFilteredStudents(result);
  }, [searchTerm, students, filterSchool, filterGender]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await getStudents();
      if (error) throw error;
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (err) {
      showNotification('Lỗi khi tải danh sách học sinh: ' + (err?.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (student) => {
    setIsEditMode(true);
    setSelectedStudent(student);
    setFormData({
      id: student.id,
      full_name: student.full_name || '',
      date_of_birth: student.date_of_birth || null,
      gender: student.gender || '',
      address: student.address || '',
      phone: student.phone || '',
      email: student.email || '',
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      parent_zalo: student.parent_zalo || '',
      school: student.school || '',
      notes: student.notes || ''
    });
    setOpenDialog(true);
  };

  const handleOpenForCreate = () => {
    setIsEditMode(false);
    setSelectedStudent(null);
    setFormData({
      id: null,
      full_name: '',
      date_of_birth: null,
      gender: '',
      address: '',
      phone: '',
      email: '',
      parent_name: '',
      parent_phone: '',
      parent_zalo: '',
      school: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setIsEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.full_name?.trim()) {
      showNotification('Vui lòng nhập họ tên học sinh', 'error');
      return;
    }
    setLoading(true);
    try {
      if (isEditMode && formData.id) {
        const { error } = await updateStudent(formData.id, formData);
        if (error) throw error;
        showNotification('Cập nhật học sinh thành công', 'success');
      } else {
        const { data, error } = await createStudent(formData);
        if (error) throw error;
        showNotification('Thêm học sinh thành công', 'success');
      }
      handleCloseDialog();
      await fetchStudents();
    } catch (err) {
      showNotification('Lỗi khi lưu học sinh: ' + (err?.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    setLoading(true);
    try {
      const { error } = await deleteStudent(formData.id);
      if (error) throw error;
      showNotification('Xóa học sinh thành công', 'success');
      handleCloseDialog();
      await fetchStudents();
    } catch (err) {
      showNotification('Lỗi khi xóa học sinh: ' + (err?.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            placeholder="Tìm kiếm học sinh..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Trường</InputLabel>
            <Select value={filterSchool} label="Trường" onChange={e => setFilterSchool(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              {[...new Set(students.map(s => s.school).filter(Boolean))].map(school => (
                <MenuItem key={school} value={school}>{school}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Giới tính</InputLabel>
            <Select value={filterGender} label="Giới tính" onChange={e => setFilterGender(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              {[...new Set(students.map(s => s.gender).filter(Boolean))].map(g => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* removed sort control as requested */}
        </Box>

        <Button variant="contained" onClick={handleOpenForCreate}>Thêm học sinh</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Họ tên</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Trường</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map(student => (
              <TableRow key={student.id} hover onClick={() => handleRowClick(student)} style={{ cursor: 'pointer' }}>
                <TableCell>{student.full_name}</TableCell>
                <TableCell>{student.phone}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.school}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Chỉnh sửa học sinh' : 'Thêm học sinh'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="full_name" label="Họ và tên" fullWidth value={formData.full_name} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="phone" label="Số điện thoại" fullWidth value={formData.phone} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="email" label="Email" fullWidth value={formData.email} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="school" label="Trường" fullWidth value={formData.school} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField name="address" label="Địa chỉ" fullWidth value={formData.address} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label="Ghi chú" fullWidth multiline rows={3} value={formData.notes} onChange={handleInputChange} margin="normal" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {isEditMode && <Button color="error" onClick={handleDelete}>Xóa</Button>}
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>{isEditMode ? 'Lưu' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StudentManagement;
