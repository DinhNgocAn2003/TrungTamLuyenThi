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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogContentText,
  InputAdornment,
  Chip,
  Avatar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  getUserProfiles,
  createUser,
  updateUserProfile,
  deleteUser,
  resetUserPassword
} from '../../services/supabase/database';
import PageHeader from '../../components/common/PageHeader';

function UserManagement() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student'
  });
  
  const [newPassword, setNewPassword] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await getUserProfiles();
      if (error) throw error;
      
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Lỗi khi tải danh sách tài khoản: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (user = null) => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        password: '',
        role: user.role
      });
      setSelectedUser(user);
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: generatePassword(),
        role: 'student'
      });
      setSelectedUser(null);
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const generatePassword = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  const generateUsername = (fullName) => {
    const nameOnly = fullName.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();
    
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${nameOnly}${randomNum}`;
  };
  
  const handleSubmit = async () => {
    if (!formData.full_name.trim() || !formData.email.trim()) {
      showNotification('Vui lòng nhập đầy đủ thông tin bắt buộc', 'error');
      return;
    }
    
    setLoading(true);
    try {
      let result;
      
      if (selectedUser) {
        // Cập nhật tài khoản
        result = await updateUserProfile(selectedUser.id, {
          full_name: formData.full_name,
          role: formData.role
        });
      } else {
        // Tạo tài khoản mới
        result = await createUser({
          email: formData.email,
          password: formData.password,
          user_metadata: {
            full_name: formData.full_name,
            role: formData.role
          }
        });
      }
      
      if (result.error) throw result.error;
      
      showNotification(
        selectedUser ? 'Cập nhật tài khoản thành công' : 'Tạo tài khoản mới thành công',
        'success'
      );
      
      if (!selectedUser) {
        showNotification(
          `Thông tin đăng nhập: ${formData.email} / ${formData.password}`,
          'info'
        );
      }
      
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification('Lỗi khi lưu tài khoản: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const { error } = await deleteUser(selectedUser.id);
      if (error) throw error;
      
      showNotification('Xóa tài khoản thành công', 'success');
      setDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Lỗi khi xóa tài khoản: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const { error } = await resetUserPassword(selectedUser.id, newPassword);
      if (error) throw error;
      
      showNotification('Đặt lại mật khẩu thành công', 'success');
      showNotification(`Mật khẩu mới: ${newPassword}`, 'info');
      setPasswordDialog(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
      showNotification('Lỗi khi đặt lại mật khẩu: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedUser(null);
  };
  
  const handleOpenPasswordDialog = (user) => {
    setSelectedUser(user);
    setNewPassword(generatePassword());
    setPasswordDialog(true);
  };
  
  const handleClosePasswordDialog = () => {
    setPasswordDialog(false);
    setSelectedUser(null);
    setNewPassword('');
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showNotification('Đã sao chép vào clipboard', 'success');
      })
      .catch(err => {
        console.error('Lỗi khi sao chép:', err);
        showNotification('Lỗi khi sao chép vào clipboard', 'error');
      });
  };
  
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'warning';
      case 'student':
        return 'primary';
      default:
        return 'default';
    }
  };
  
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giáo viên';
      case 'student':
        return 'Học sinh';
      default:
        return 'Khác';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Quản lý tài khoản"
        breadcrumbs={[
          { label: 'Trang chủ', link: '/admin' },
          { label: 'Quản lý tài khoản' }
        ]}
      />
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          placeholder="Tìm kiếm tài khoản..."
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
          Thêm tài khoản
        </Button>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Danh sách tài khoản ({filteredUsers.length})
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tài khoản</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Đăng nhập đầu</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: getRoleColor(user.role) + '.light' }}>
                          {user.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">{user.full_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {user.id.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.first_login ? 'Chưa đăng nhập' : 'Đã đăng nhập'}
                        color={user.first_login ? 'warning' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(user)}
                        title="Sửa tài khoản"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => handleOpenPasswordDialog(user)}
                        title="Đặt lại mật khẩu"
                      >
                        <LockIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(user)}
                        title="Xóa tài khoản"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>
                      {searchTerm ? 'Không tìm thấy tài khoản nào' : 'Chưa có tài khoản nào.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Dialog thêm/sửa tài khoản */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="full_name"
                label="Họ và tên"
                fullWidth
                value={formData.full_name}
                onChange={handleInputChange}
                margin="normal"
                required
                autoFocus
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={!!selectedUser}
              />
            </Grid>
            
            {!selectedUser && (
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="Mật khẩu"
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => copyToClipboard(formData.password)}>
                          <ContentCopyIcon />
                        </IconButton>
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Vai trò</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Vai trò"
                >
                  <MenuItem value="student">Học sinh</MenuItem>
                  <MenuItem value="teacher">Giáo viên</MenuItem>
                  <MenuItem value="admin">Quản trị viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedUser ? 'Cập nhật' : 'Tạo tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog đặt lại mật khẩu */}
      <Dialog open={passwordDialog} onClose={handleClosePasswordDialog}>
        <DialogTitle>Đặt lại mật khẩu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Đặt lại mật khẩu cho tài khoản "{selectedUser?.full_name}"
          </DialogContentText>
          
          <TextField
            label="Mật khẩu mới"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => copyToClipboard(newPassword)}>
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="outlined"
            onClick={() => setNewPassword(generatePassword())}
            sx={{ mt: 1 }}
          >
            Tạo mật khẩu ngẫu nhiên
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Hủy</Button>
          <Button onClick={handleResetPassword} variant="contained" color="primary">
            Đặt lại mật khẩu
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tài khoản "{selectedUser?.full_name}"?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Xóa tài khoản
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
