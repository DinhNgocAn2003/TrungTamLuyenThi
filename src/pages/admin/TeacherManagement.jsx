import React, { useState, useEffect } from 'react';
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
  Paper,
  Chip,
  Autocomplete
} from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../services/supabase/database';
import { getSubjectGradeCombinations, saveTeacherAssignments, getTeacherSubjectGrades } from '../../services/supabase/teacherAssignments';
import PageHeader from '../../components/common/PageHeader';

const TeacherManagement = () => {
  const { showNotification } = useNotification();
  const { setLoading } = useLoading();

  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subjectsGrades, setSubjectsGrades] = useState([]);
  const [selectedSpecializationIds, setSelectedSpecializationIds] = useState([]);
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

  useEffect(() => {
    fetchTeachers();
    fetchSubjectsGrades();
  }, []);

  useEffect(() => {
    let result = Array.isArray(teachers) ? [...teachers] : [];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.full_name || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.phone || '').includes(q)
      );
    }

    if (filterSubject) {
      result = result.filter(t => (t.specialization || '').split(', ').includes(filterSubject));
    }

    setFilteredTeachers(result);
  }, [teachers, searchQuery, filterSubject]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await getTeachers();
      if (error) throw error;
      setTeachers(data || []);
    } catch (err) {
      showNotification('Lỗi khi tải danh sách giáo viên: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsGrades = async () => {
    try {
      const { data, error } = await getSubjectGradeCombinations();
      if (error) throw error;
      setSubjectsGrades(data || []);
    } catch (err) {
      // silent fail - not critical for listing teachers
    }
  };

  const getSpecializationOptions = () => {
    return subjectsGrades.map(sg => ({ id: sg.id, label: sg.name || sg.display_name, value: sg.id }));
  };

  const handleOpenForCreate = () => {
    setIsEditMode(false);
    setSelectedTeacher(null);
    setSelectedSpecializationIds([]);
    setFormData({ full_name: '', phone: '', email: '', address: '', specialization: '', year_graduation: '', university: '', notes: '' });
    setOpenDialog(true);
  };

  const handleRowClick = async (teacher) => {
    setLoading(true);
    try {
      setIsEditMode(true);
      setSelectedTeacher(teacher);
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

      // load teacher specializations
      if (teacher.user_id) {
        const { data: teacherSpecs } = await getTeacherSubjectGrades(teacher.user_id);
        if (teacherSpecs) {
          const ids = teacherSpecs.map(ts => ts.subjects_grades_id);
          setSelectedSpecializationIds(ids);
        } else {
          setSelectedSpecializationIds([]);
        }
      } else {
        setSelectedSpecializationIds([]);
      }

      setOpenDialog(true);
    } catch (err) {
      showNotification('Lỗi khi tải thông tin giáo viên: ' + (err?.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeacher(null);
    setIsEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (!formData.full_name?.trim() || !formData.phone?.trim()) {
        showNotification('Vui lòng nhập Họ tên và Số điện thoại', 'error');
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
      if (isEditMode && selectedTeacher) {
        result = await updateTeacher(selectedTeacher.id, teacherData);
        if (result.error) throw result.error;

        if (selectedSpecializationIds.length > 0 && selectedTeacher.user_id) {
          const assignRes = await saveTeacherAssignments(selectedTeacher.user_id, selectedSpecializationIds);
          if (assignRes.error) {
            showNotification('Cập nhật giáo viên nhưng có lỗi khi lưu chuyên môn', 'warning');
          }
        }
      } else {
        result = await createTeacher(teacherData);
        if (result.error) throw result.error;

        if (result.data && selectedSpecializationIds.length > 0) {
          const assignRes = await saveTeacherAssignments(result.data.user_id, selectedSpecializationIds);
          if (assignRes.error) {
            showNotification('Thêm giáo viên nhưng có lỗi khi lưu chuyên môn', 'warning');
          }
        }
      }

      showNotification(isEditMode ? 'Cập nhật giáo viên thành công' : 'Thêm giáo viên thành công', 'success');
      handleCloseDialog();
      fetchTeachers();
    } catch (err) {
      showNotification('Lỗi khi lưu giáo viên: ' + (err?.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    setLoading(true);
    try {
      const { error } = await deleteTeacher(selectedTeacher.id);
      if (error) throw error;
      showNotification('Xóa giáo viên thành công', 'success');
      handleCloseDialog();
      fetchTeachers();
    } catch (err) {
      showNotification('Lỗi khi xóa giáo viên: ' + (err?.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={2}>
      <PageHeader
        title="Quản lý Giáo viên"
        subtitle="Danh sách gọn, click để sửa hoặc xóa"
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            placeholder="Tìm kiếm giáo viên..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Chuyên môn</InputLabel>
            <Select value={filterSubject} label="Chuyên môn" onChange={e => setFilterSubject(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              {Array.from(new Set(subjectsGrades.map(sg => sg.name || sg.display_name).filter(Boolean))).map(name => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* removed sort control as requested */}
        </Box>

        <Button variant="contained" onClick={handleOpenForCreate}>Thêm giáo viên</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Họ tên</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Chuyên môn</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeachers.map(teacher => (
              <TableRow key={teacher.user_id || teacher.id} hover onClick={() => handleRowClick(teacher)} style={{ cursor: 'pointer' }}>
                <TableCell>{teacher.full_name}</TableCell>
                <TableCell>{teacher.phone}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>
                  {teacher.specialization ? (
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {teacher.specialization.split(', ').slice(0, 2).map((spec, idx) => (
                        <Chip key={idx} label={spec} size="small" color="primary" variant="outlined" />
                      ))}
                      {teacher.specialization.split(', ').length > 2 && (
                        <Chip label={`+${teacher.specialization.split(', ').length - 2}`} size="small" color="default" variant="outlined" />
                      )}
                    </Box>
                  ) : (
                    <Chip label="Chưa cập nhật" size="small" color="default" variant="outlined" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên'}</DialogTitle>
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
              <Autocomplete
                multiple
                options={getSpecializationOptions()}
                value={getSpecializationOptions().filter(option => selectedSpecializationIds.includes(option.id))}
                onChange={(e, newValue) => setSelectedSpecializationIds(newValue.map(v => v.id))}
                getOptionLabel={(opt) => opt.label || ''}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderTags={(value, getTagProps) => value.map((option, index) => { const { key, ...tagProps } = getTagProps({ index }); return (<Chip key={key} label={option.label} {...tagProps} size="small" color="primary" variant="outlined" />); })}
                renderInput={(params) => <TextField {...params} label="Chuyên môn" placeholder="Chọn..." margin="normal" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="year_graduation" label="Năm tốt nghiệp" fullWidth type="number" value={formData.year_graduation} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="university" label="Trường đại học" fullWidth value={formData.university} onChange={handleInputChange} margin="normal" />
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
};

export default TeacherManagement;
