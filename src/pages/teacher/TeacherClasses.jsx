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
  IconButton,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Class as ClassIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  EventNote as EventNoteIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon
} from '@mui/icons-material';

// Dữ liệu mẫu
const mockClasses = [
  {
    id: 1,
    name: 'Toán 10A1',
    subject: 'Toán học',
    grade: 10,
    students: 32,
    schedule: 'Thứ 2, 4, 6 - 8:00-9:30',
    room: 'Phòng 201',
    semester: 'Học kỳ 1 - 2024-2025',
    description: 'Lớp học toán nâng cao dành cho học sinh khá giỏi',
    nextSession: '2025-07-27T08:00:00',
    totalSessions: 45,
    completedSessions: 12,
    students_list: [
      { id: 1, name: 'Nguyễn Văn A', student_id: 'HS001', attendance_rate: 95 },
      { id: 2, name: 'Trần Thị B', student_id: 'HS002', attendance_rate: 88 },
      { id: 3, name: 'Lê Văn C', student_id: 'HS003', attendance_rate: 92 }
    ]
  },
  {
    id: 2,
    name: 'Toán 11B2',
    subject: 'Toán học',
    grade: 11,
    students: 28,
    schedule: 'Thứ 3, 5, 7 - 10:00-11:30',
    room: 'Phòng 205',
    semester: 'Học kỳ 1 - 2024-2025',
    description: 'Lớp học toán cơ bản với phương pháp giảng dạy hiện đại',
    nextSession: '2025-07-27T10:00:00',
    totalSessions: 45,
    completedSessions: 15,
    students_list: [
      { id: 4, name: 'Phạm Văn D', student_id: 'HS004', attendance_rate: 90 },
      { id: 5, name: 'Hoàng Thị E', student_id: 'HS005', attendance_rate: 85 }
    ]
  },
  {
    id: 3,
    name: 'Toán 12C1',
    subject: 'Toán học',
    grade: 12,
    students: 25,
    schedule: 'Thứ 2, 4, 6 - 14:00-15:30',
    room: 'Phòng 301',
    semester: 'Học kỳ 1 - 2024-2025',
    description: 'Lớp ôn thi THPT Quốc gia chuyên sâu',
    nextSession: '2025-07-28T14:00:00',
    totalSessions: 50,
    completedSessions: 18,
    students_list: [
      { id: 6, name: 'Vũ Văn F', student_id: 'HS006', attendance_rate: 97 },
      { id: 7, name: 'Đặng Thị G', student_id: 'HS007', attendance_rate: 93 }
    ]
  }
];

function TeacherClasses() {
  const [classes, setClasses] = useState(mockClasses);
  const [selectedClass, setSelectedClass] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleViewClass = (classItem) => {
    setSelectedClass(classItem);
    setDialogOpen(true);
    setTabValue(0);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedClass(null);
  };

  const getProgressColor = (completed, total) => {
    const percentage = (completed / total) * 100;
    if (percentage < 30) return 'error';
    if (percentage < 70) return 'warning';
    return 'success';
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'warning';
    return 'error';
  };

  const ClassCard = ({ classItem }) => (
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
              bgcolor: 'primary.light',
              width: 60,
              height: 60
            }}
          >
            <ClassIcon fontSize="large" />
          </Avatar>
          <Chip 
            label={`Lớp ${classItem.grade}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {classItem.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {classItem.description}
        </Typography>

        <Box mt={2} mb={2}>
          <Box display="flex" alignItems="center" mb={1}>
            <PeopleIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">
              {classItem.students} học sinh
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" mb={1}>
            <ScheduleIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">
              {classItem.schedule}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <EventNoteIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">
              Phòng: {classItem.room}
            </Typography>
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tiến độ học tập: {classItem.completedSessions}/{classItem.totalSessions} buổi
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Box flex={1} bgcolor="grey.200" borderRadius={1} height={8}>
              <Box
                bgcolor={`${getProgressColor(classItem.completedSessions, classItem.totalSessions)}.main`}
                height="100%"
                borderRadius={1}
                width={`${(classItem.completedSessions / classItem.totalSessions) * 100}%`}
              />
            </Box>
            <Typography variant="caption" fontWeight="bold">
              {Math.round((classItem.completedSessions / classItem.totalSessions) * 100)}%
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<VisibilityIcon />}
            onClick={() => handleViewClass(classItem)}
            fullWidth
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Xem chi tiết
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
          Lớp học của tôi 📚
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.8)">
          Quản lý {classes.length} lớp học đang giảng dạy
        </Typography>
      </Box>

      {/* Classes Grid */}
      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} md={6} lg={4} key={classItem.id}>
            <ClassCard classItem={classItem} />
          </Grid>
        ))}
      </Grid>

      {/* Class Detail Dialog */}
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
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }
        }}
      >
        {selectedClass && (
          <>
            <DialogTitle sx={{ 
              pb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px'
            }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <ClassIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedClass.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedClass.subject} - {selectedClass.semester}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Thông tin chung" />
                <Tab label="Danh sách học sinh" />
                <Tab label="Lịch học" />
              </Tabs>

              <Box p={3}>
                {tabValue === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Thông tin cơ bản
                        </Typography>
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">Tên lớp</Typography>
                          <Typography variant="body1" fontWeight="600">{selectedClass.name}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">Môn học</Typography>
                          <Typography variant="body1" fontWeight="600">{selectedClass.subject}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">Khối lớp</Typography>
                          <Typography variant="body1" fontWeight="600">Lớp {selectedClass.grade}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">Phòng học</Typography>
                          <Typography variant="body1" fontWeight="600">{selectedClass.room}</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Thống kê
                        </Typography>
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">Số học sinh</Typography>
                          <Typography variant="h5" fontWeight="bold" color="primary.main">
                            {selectedClass.students}
                          </Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">Tiến độ học tập</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {selectedClass.completedSessions}/{selectedClass.totalSessions} buổi
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            ({Math.round((selectedClass.completedSessions / selectedClass.totalSessions) * 100)}%)
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Buổi học tiếp theo</Typography>
                          <Typography variant="body1" fontWeight="600">
                            {new Date(selectedClass.nextSession).toLocaleString('vi-VN')}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Danh sách học sinh ({selectedClass.students_list.length})
                    </Typography>
                    <List>
                      {selectedClass.students_list.map((student, index) => (
                        <React.Fragment key={student.id}>
                          <ListItem
                            sx={{
                              borderRadius: '10px',
                              '&:hover': { bgcolor: 'grey.50' }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.light' }}>
                                {student.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="600">
                                  {student.name}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Mã học sinh: {student.student_id}
                                  </Typography>
                                  <Chip
                                    label={`Điểm danh: ${student.attendance_rate}%`}
                                    size="small"
                                    color={getAttendanceColor(student.attendance_rate)}
                                    variant="outlined"
                                    sx={{ mt: 0.5 }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < selectedClass.students_list.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                )}

                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Lịch học
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body1" gutterBottom>
                        <strong>Thời gian:</strong> {selectedClass.schedule}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Phòng học:</strong> {selectedClass.room}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Buổi học tiếp theo:</strong> {new Date(selectedClass.nextSession).toLocaleString('vi-VN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={2}>
                        {selectedClass.description}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{ borderRadius: '10px', textTransform: 'none' }}
              >
                Đóng
              </Button>
              <Button
                variant="contained"
                startIcon={<EventNoteIcon />}
                sx={{ borderRadius: '10px', textTransform: 'none' }}
              >
                Điểm danh
              </Button>
              <Button
                variant="contained"
                startIcon={<GradeIcon />}
                sx={{ borderRadius: '10px', textTransform: 'none' }}
              >
                Nhập điểm
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default TeacherClasses;
