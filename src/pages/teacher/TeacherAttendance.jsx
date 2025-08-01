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
  Checkbox,
  FormControlLabel,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Fab
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  Class as ClassIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  QrCodeScanner as QrCodeScannerIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Data will be loaded from API
const mockClasses = [];
const mockStudents = {};

function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [qrScanDialog, setQrScanDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedClass) {
      setStudents(mockStudents[selectedClass] || []);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const handleAttendanceChange = (studentId, present) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, present }
          : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Saving attendance:', {
        classId: selectedClass,
        date: selectedDate,
        students: students,
        notes: notes
      });
      
      setAttendanceDialog(false);
      // Show success notification here
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPresentCount = () => students.filter(s => s.present).length;
  const getAbsentCount = () => students.filter(s => !s.present).length;
  const getAttendanceRate = () => {
    if (students.length === 0) return 0;
    return Math.round((getPresentCount() / students.length) * 100);
  };

  const handleOpenAttendance = () => {
    if (!selectedClass) {
      alert('Vui lòng chọn lớp học');
      return;
    }
    setAttendanceDialog(true);
  };

  const handleQrScan = () => {
    setQrScanDialog(true);
  };

  const mockQrScanResult = (studentId) => {
    // Simulate QR scan result
    const student = students.find(s => s.student_id === studentId);
    if (student) {
      handleAttendanceChange(student.id, true);
      return true;
    }
    return false;
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
          Điểm danh học sinh 📋
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.8)">
          Quản lý điểm danh cho các lớp học của bạn
        </Typography>
      </Box>

      {/* Controls */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          p: 3,
          mb: 3
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Chọn lớp học</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Chọn lớp học"
              >
                {mockClasses.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name} ({cls.students} học sinh)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Ngày điểm danh"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<EventNoteIcon />}
                onClick={handleOpenAttendance}
                disabled={!selectedClass}
                sx={{ borderRadius: '10px', textTransform: 'none' }}
              >
                Điểm danh thủ công
              </Button>
              <Button
                variant="outlined"
                startIcon={<QrCodeScannerIcon />}
                onClick={handleQrScan}
                disabled={!selectedClass}
                sx={{ borderRadius: '10px', textTransform: 'none' }}
              >
                Quét QR
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Current Class Info */}
      {selectedClass && (
        <Grid container spacing={3} mb={3}>
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
                    <ClassIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    {mockClasses.find(c => c.id === parseInt(selectedClass))?.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tổng số học sinh: {students.length}
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
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Có mặt: {getPresentCount()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tỷ lệ: {getAttendanceRate()}%
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
                    <CancelIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Vắng mặt: {getAbsentCount()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Cần theo dõi
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Student List */}
      {students.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            p: 3
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Danh sách học sinh
          </Typography>
          <List>
            {students.map((student, index) => (
              <React.Fragment key={student.id}>
                <ListItem
                  sx={{
                    borderRadius: '10px',
                    '&:hover': { bgcolor: 'grey.50' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: student.present ? 'success.light' : 'error.light' 
                      }}
                    >
                      {student.present ? <CheckCircleIcon /> : <CancelIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="600">
                        {student.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Mã học sinh: {student.student_id}
                      </Typography>
                    }
                  />
                  <Chip
                    label={student.present ? 'Có mặt' : 'Vắng mặt'}
                    color={student.present ? 'success' : 'error'}
                    variant="outlined"
                  />
                </ListItem>
                {index < students.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Attendance Dialog */}
      <Dialog
        open={attendanceDialog}
        onClose={() => setAttendanceDialog(false)}
        maxWidth="md"
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
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <EventNoteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Điểm danh lớp {mockClasses.find(c => c.id === parseInt(selectedClass))?.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Đánh dấu học sinh có mặt hoặc vắng mặt. Dữ liệu sẽ được lưu vào hệ thống.
          </Alert>

          <List>
            {students.map((student, index) => (
              <React.Fragment key={student.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      {student.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={student.name}
                    secondary={`Mã: ${student.student_id}`}
                  />
                  <Box display="flex" gap={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={student.present}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.checked)}
                          color="success"
                        />
                      }
                      label="Có mặt"
                    />
                  </Box>
                </ListItem>
                {index < students.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Ghi chú (tùy chọn)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Ghi chú về buổi học, học sinh vắng mặt..."
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setAttendanceDialog(false)}
            variant="outlined"
            disabled={saving}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveAttendance}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            {saving ? 'Đang lưu...' : 'Lưu điểm danh'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Scan Dialog */}
      <Dialog
        open={qrScanDialog}
        onClose={() => setQrScanDialog(false)}
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
                <QrCodeScannerIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Quét mã QR điểm danh
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setQrScanDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Box 
            sx={{
              border: '2px dashed #ccc',
              borderRadius: '10px',
              p: 4,
              mb: 3,
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Sẵn sàng quét mã QR
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hướng camera vào mã QR của học sinh
            </Typography>
          </Box>

          <Alert severity="info">
            Học sinh cần mở ứng dụng và hiển thị mã QR để điểm danh
          </Alert>

          {/* Mock QR scan buttons for demo */}
          <Box mt={2}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Demo - Nhấn để mô phỏng quét QR:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
              {students.filter(s => !s.present).map(student => (
                <Button
                  key={student.id}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (mockQrScanResult(student.student_id)) {
                      alert(`Đã điểm danh cho ${student.name}`);
                    }
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  {student.student_id}
                </Button>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TeacherAttendance;
