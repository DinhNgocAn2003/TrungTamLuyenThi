import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Fab,
  Tabs,
  Tab
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Class as ClassIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Dữ liệu mẫu
const mockClasses = [
  { id: 1, name: 'Toán 10A1', students: 32 },
  { id: 2, name: 'Toán 11B2', students: 28 },
  { id: 3, name: 'Toán 12C1', students: 25 }
];

const mockTests = [
  {
    id: 1,
    name: 'Kiểm tra 15 phút - Chương 2',
    classId: 1,
    className: 'Toán 10A1',
    date: '2025-07-30',
    time: '08:00',
    duration: 15,
    coefficient: 1,
    description: 'Kiểm tra nắm vững kiến thức chương 2: Hàm số bậc nhất',
    status: 'scheduled', // scheduled, completed, cancelled
    createdDate: '2025-07-25',
    notificationSent: true
  },
  {
    id: 2,
    name: 'Kiểm tra 1 tiết - Giới hạn',
    classId: 2,
    className: 'Toán 11B2',
    date: '2025-08-02',
    time: '10:00',
    duration: 45,
    coefficient: 2,
    description: 'Kiểm tra chương Giới hạn hàm số và dãy số',
    status: 'scheduled',
    createdDate: '2025-07-24',
    notificationSent: false
  },
  {
    id: 3,
    name: 'Kiểm tra học kỳ 1',
    classId: 3,
    className: 'Toán 12C1',
    date: '2025-08-15',
    time: '14:00',
    duration: 90,
    coefficient: 3,
    description: 'Kiểm tra tổng hợp kiến thức học kỳ 1',
    status: 'scheduled',
    createdDate: '2025-07-20',
    notificationSent: true
  }
];

function TeacherTests() {
  const [tests, setTests] = useState(mockTests);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    classId: '',
    date: '',
    time: '',
    duration: 15,
    coefficient: 1,
    description: ''
  });

  const handleOpenDialog = (test = null) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        name: test.name,
        classId: test.classId,
        date: test.date,
        time: test.time,
        duration: test.duration,
        coefficient: test.coefficient,
        description: test.description
      });
    } else {
      setEditingTest(null);
      setFormData({
        name: '',
        classId: '',
        date: '',
        time: '',
        duration: 15,
        coefficient: 1,
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTest(null);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSaveTest = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const className = mockClasses.find(c => c.id === parseInt(formData.classId))?.name;
      
      if (editingTest) {
        // Update existing test
        setTests(prev => prev.map(test => 
          test.id === editingTest.id 
            ? {
                ...test,
                ...formData,
                className,
                classId: parseInt(formData.classId)
              }
            : test
        ));
      } else {
        // Add new test
        const newTest = {
          id: Date.now(),
          ...formData,
          className,
          classId: parseInt(formData.classId),
          status: 'scheduled',
          createdDate: new Date().toISOString().split('T')[0],
          notificationSent: false
        };
        setTests(prev => [...prev, newTest]);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving test:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài kiểm tra này?')) {
      setTests(prev => prev.filter(test => test.id !== testId));
    }
  };

  const handleSendNotification = async (testId) => {
    if (window.confirm('Gửi thông báo về bài kiểm tra này cho học sinh?')) {
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, notificationSent: true }
          : test
      ));
      // Show success message
      alert('Đã gửi thông báo cho học sinh!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getDurationText = (duration) => {
    if (duration < 60) {
      return `${duration} phút`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h${minutes}m` : `${hours} giờ`;
    }
  };

  const getCoefficientColor = (coefficient) => {
    switch (coefficient) {
      case 1: return 'info';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  const upcomingTests = tests.filter(test => 
    test.status === 'scheduled' && new Date(test.date) >= new Date()
  );
  const pastTests = tests.filter(test => 
    test.status === 'completed' || new Date(test.date) < new Date()
  );

  const TestCard = ({ test }) => (
    <Card
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: getStatusColor(test.status) + '.light',
              width: 50,
              height: 50
            }}
          >
            <AssignmentIcon />
          </Avatar>
          <Box display="flex" gap={1}>
            <Chip 
              label={getStatusText(test.status)}
              color={getStatusColor(test.status)}
              size="small"
            />
            <Chip 
              label={`Hệ số ${test.coefficient}`}
              color={getCoefficientColor(test.coefficient)}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {test.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {test.description}
        </Typography>

        <Box mt={2} mb={2}>
          <Box display="flex" alignItems="center" mb={1}>
            <ClassIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">
              {test.className}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" mb={1}>
            <ScheduleIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">
              {new Date(test.date).toLocaleDateString('vi-VN')} - {test.time}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Thời gian: {getDurationText(test.duration)}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="caption" color="text.secondary">
            Tạo ngày: {new Date(test.createdDate).toLocaleDateString('vi-VN')}
          </Typography>
          {test.notificationSent ? (
            <Chip label="Đã thông báo" color="success" size="small" variant="outlined" />
          ) : (
            <Chip label="Chưa thông báo" color="warning" size="small" variant="outlined" />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleOpenDialog(test)}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Sửa
          </Button>
          
          {!test.notificationSent && (
            <Button
              size="small"
              variant="contained"
              startIcon={<NotificationsIcon />}
              onClick={() => handleSendNotification(test.id)}
              color="warning"
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Thông báo
            </Button>
          )}
          
          <Button
            size="small"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteTest(test.id)}
            color="error"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Xóa
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
          Quản lý bài kiểm tra 📝
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.8)">
          Tạo và thông báo lịch kiểm tra cho học sinh
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Tổng bài kiểm tra
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {tests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Sắp diễn ra
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {upcomingTests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'error.light', mr: 2 }}>
                  <NotificationsIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Chưa thông báo
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {tests.filter(t => !t.notificationSent).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tests List */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Sắp diễn ra (${upcomingTests.length})`} />
          <Tab label={`Đã qua (${pastTests.length})`} />
          <Tab label={`Tất cả (${tests.length})`} />
        </Tabs>

        <Box p={3}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {upcomingTests.map((test) => (
                <Grid item xs={12} md={6} lg={4} key={test.id}>
                  <TestCard test={test} />
                </Grid>
              ))}
              {upcomingTests.length === 0 && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Chưa có bài kiểm tra nào sắp diễn ra
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                      sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                      Tạo bài kiểm tra mới
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              {pastTests.map((test) => (
                <Grid item xs={12} md={6} lg={4} key={test.id}>
                  <TestCard test={test} />
                </Grid>
              ))}
              {pastTests.length === 0 && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                      Chưa có bài kiểm tra nào đã hoàn thành
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3}>
              {tests.map((test) => (
                <Grid item xs={12} md={6} lg={4} key={test.id}>
                  <TestCard test={test} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenDialog()}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create/Edit Test Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AssignmentIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {editingTest ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}
              </Typography>
            </Box>
            <IconButton 
              onClick={handleCloseDialog}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên bài kiểm tra"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="VD: Kiểm tra 15 phút - Chương 1"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Lớp học</InputLabel>
                <Select
                  value={formData.classId}
                  onChange={handleInputChange('classId')}
                  label="Lớp học"
                >
                  {mockClasses.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.students} học sinh)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày kiểm tra"
                value={formData.date}
                onChange={handleInputChange('date')}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Giờ kiểm tra"
                value={formData.time}
                onChange={handleInputChange('time')}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Thời gian (phút)</InputLabel>
                <Select
                  value={formData.duration}
                  onChange={handleInputChange('duration')}
                  label="Thời gian (phút)"
                >
                  <MenuItem value={15}>15 phút</MenuItem>
                  <MenuItem value={30}>30 phút</MenuItem>
                  <MenuItem value={45}>45 phút</MenuItem>
                  <MenuItem value={60}>60 phút</MenuItem>
                  <MenuItem value={90}>90 phút</MenuItem>
                  <MenuItem value={120}>120 phút</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Hệ số điểm</InputLabel>
                <Select
                  value={formData.coefficient}
                  onChange={handleInputChange('coefficient')}
                  label="Hệ số điểm"
                >
                  <MenuItem value={1}>Hệ số 1 (Kiểm tra thường xuyên)</MenuItem>
                  <MenuItem value={2}>Hệ số 2 (Kiểm tra định kỳ)</MenuItem>
                  <MenuItem value={3}>Hệ số 3 (Kiểm tra học kỳ)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mô tả bài kiểm tra"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Mô tả nội dung, chương, bài sẽ kiểm tra..."
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            Sau khi tạo bài kiểm tra, bạn có thể gửi thông báo cho học sinh về lịch thi.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            disabled={saving}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveTest}
            variant="contained"
            disabled={saving || !formData.name || !formData.classId || !formData.date || !formData.time}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            {saving ? 'Đang lưu...' : (editingTest ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeacherTests;
