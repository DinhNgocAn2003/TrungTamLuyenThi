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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Grade as GradeIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  Class as ClassIcon
} from '@mui/icons-material';

// Data will be loaded from API
const mockClasses = [];
const mockTests = [];
const mockGrades = {};
const mockStudents = {};

function TeacherGrades() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [grades, setGrades] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [tempGrades, setTempGrades] = useState({});
  const [availableTests, setAvailableTests] = useState([]);

  useEffect(() => {
    if (selectedClass) {
      const classTests = mockTests.filter(test => test.classId === parseInt(selectedClass));
      setAvailableTests(classTests);
      setSelectedTest('');
    } else {
      setAvailableTests([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedTest) {
      const testGrades = mockGrades[selectedTest] || [];
      const gradeMap = {};
      testGrades.forEach(grade => {
        gradeMap[grade.studentId] = grade.score;
      });
      setGrades(gradeMap);
      setTempGrades(gradeMap);
    } else {
      setGrades({});
      setTempGrades({});
    }
  }, [selectedTest]);

  const handleOpenGradeDialog = () => {
    if (!selectedClass || !selectedTest) {
      alert('Vui lòng chọn lớp học và bài kiểm tra');
      return;
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTempGrades(grades);
  };

  const handleGradeChange = (studentId, score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      return;
    }
    setTempGrades(prev => ({
      ...prev,
      [studentId]: numScore
    }));
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGrades(tempGrades);
      console.log('Saving grades:', {
        testId: selectedTest,
        grades: tempGrades
      });
      
      setDialogOpen(false);
      alert('Đã lưu điểm thành công!');
    } catch (error) {
      console.error('Error saving grades:', error);
    } finally {
      setSaving(false);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6.5) return 'warning';
    if (score >= 5) return 'info';
    return 'error';
  };

  const getGradeStats = () => {
    const scores = Object.values(grades).filter(score => score !== undefined);
    if (scores.length === 0) return { avg: 0, highest: 0, lowest: 0, passRate: 0 };
    
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passCount = scores.filter(score => score >= 5).length;
    const passRate = (passCount / scores.length) * 100;
    
    return {
      avg: avg.toFixed(1),
      highest,
      lowest,
      passRate: passRate.toFixed(1)
    };
  };

  const currentTest = availableTests.find(test => test.id === parseInt(selectedTest));
  const currentStudents = selectedClass ? mockStudents[selectedClass] || [] : [];
  const stats = getGradeStats();

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
          Nhập điểm kiểm tra 📊
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.8)">
          Quản lý điểm số và tính toán hệ số cho học sinh
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
          
          <Grid item xs={12} md={5}>
            <FormControl fullWidth disabled={!selectedClass}>
              <InputLabel>Chọn bài kiểm tra</InputLabel>
              <Select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                label="Chọn bài kiểm tra"
              >
                {availableTests.map((test) => (
                  <MenuItem key={test.id} value={test.id}>
                    {test.name} (Hệ số {test.coefficient}) - {new Date(test.date).toLocaleDateString('vi-VN')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleOpenGradeDialog}
              disabled={!selectedClass || !selectedTest}
              fullWidth
              sx={{ borderRadius: '10px', textTransform: 'none' }}
            >
              Nhập điểm
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Test Info & Stats */}
      {currentTest && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={8}>
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
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {currentTest.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentTest.className} - {new Date(currentTest.date).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
                <Box ml="auto">
                  <Chip 
                    label={`Hệ số ${currentTest.coefficient}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {stats.avg}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Điểm trung bình
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {stats.highest}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Điểm cao nhất
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {stats.lowest}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Điểm thấp nhất
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {stats.passRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tỷ lệ đạt
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                p: 3,
                height: '100%'
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Phân bố điểm
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Giỏi (8.0-10)</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Object.values(grades).filter(score => score >= 8).length} học sinh
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(Object.values(grades).filter(score => score >= 8).length / currentStudents.length) * 100}
                  color="success"
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Khá (6.5-7.9)</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Object.values(grades).filter(score => score >= 6.5 && score < 8).length} học sinh
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(Object.values(grades).filter(score => score >= 6.5 && score < 8).length / currentStudents.length) * 100}
                  color="warning"
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Cần cải thiện (&lt;6.5)</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Object.values(grades).filter(score => score < 6.5).length} học sinh
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(Object.values(grades).filter(score => score < 6.5).length / currentStudents.length) * 100}
                  color="error"
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Grades Table */}
      {currentTest && currentStudents.length > 0 && (
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
          <Box p={3} pb={0}>
            <Typography variant="h6" fontWeight="bold">
              Bảng điểm chi tiết
            </Typography>
          </Box>
          
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Mã học sinh</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Họ và tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Điểm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Xếp loại</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentStudents.map((student, index) => {
                  const score = grades[student.id];
                  const gradeText = score >= 8 ? 'Giỏi' : score >= 6.5 ? 'Khá' : score >= 5 ? 'Trung bình' : 'Yếu';
                  
                  return (
                    <TableRow key={student.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell fontWeight="600">{student.student_id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        {score !== undefined ? (
                          <Chip
                            label={score.toFixed(1)}
                            color={getGradeColor(score)}
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          <Chip label="Chưa có" color="default" variant="outlined" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {score !== undefined ? (
                          <Typography variant="body2" color={`${getGradeColor(score)}.main`} fontWeight="600">
                            {gradeText}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Grade Input Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
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
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <GradeIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Nhập điểm - {currentTest?.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Hệ số {currentTest?.coefficient} - {currentTest?.className}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={handleCloseDialog}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Alert severity="info" sx={{ m: 3, mb: 0 }}>
            Nhập điểm từ 0 đến 10. Để trống nếu học sinh không tham gia kiểm tra.
          </Alert>

          <TableContainer sx={{ maxHeight: 400, mt: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Mã học sinh</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Họ và tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Điểm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell fontWeight="600">{student.student_id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={tempGrades[student.id] || ''}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        inputProps={{
                          min: 0,
                          max: 10,
                          step: 0.1
                        }}
                        sx={{ width: 100 }}
                        placeholder="0-10"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            disabled={saving}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveGrades}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            {saving ? 'Đang lưu...' : 'Lưu điểm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeacherGrades;
