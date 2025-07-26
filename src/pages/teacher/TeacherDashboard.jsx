import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  LinearProgress,
  IconButton,
  Badge,
  Divider
} from '@mui/material';
import {
  Class as ClassIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

// Dữ liệu mẫu cho teacher dashboard
const mockData = {
  classes: [
    { id: 1, name: 'Toán 10A1', students: 32, nextSession: '2025-07-27 08:00' },
    { id: 2, name: 'Toán 11B2', students: 28, nextSession: '2025-07-27 10:00' },
    { id: 3, name: 'Toán 12C1', students: 25, nextSession: '2025-07-28 08:00' }
  ],
  upcomingTests: [
    { id: 1, className: 'Toán 10A1', testName: 'Kiểm tra 15 phút - Chương 2', date: '2025-07-30', coefficient: 1 },
    { id: 2, className: 'Toán 11B2', testName: 'Kiểm tra 1 tiết - Giới hạn', date: '2025-08-02', coefficient: 2 }
  ],
  recentActivities: [
    { id: 1, type: 'attendance', message: 'Điểm danh lớp Toán 10A1 hoàn tất', time: '30 phút trước' },
    { id: 2, type: 'grade', message: 'Nhập điểm kiểm tra Toán 11B2', time: '2 giờ trước' },
    { id: 3, type: 'test', message: 'Tạo đề kiểm tra mới cho lớp 12C1', time: '1 ngày trước' }
  ]
};

function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClasses: 3,
    totalStudents: 85,
    pendingTests: 2,
    gradingTasks: 5
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'attendance': return <EventNoteIcon color="primary" />;
      case 'grade': return <GradeIcon color="success" />;
      case 'test': return <AssignmentIcon color="warning" />;
      default: return <NotificationsIcon />;
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
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
              bgcolor: `${color}.light`,
              width: 60,
              height: 60
            }}
          >
            {icon}
          </Avatar>
          <Box textAlign="right">
            <Typography variant="h3" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
          Chào mừng trở lại, {user?.user_metadata?.full_name || 'Giáo viên'}! 👨‍🏫
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.8)">
          Hôm nay bạn có {mockData.classes.length} lớp học và {mockData.upcomingTests.length} bài kiểm tra sắp tới
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng lớp học"
            value={stats.totalClasses}
            icon={<ClassIcon />}
            color="primary"
            description="Số lớp đang giảng dạy"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Học sinh"
            value={stats.totalStudents}
            icon={<TrendingUpIcon />}
            color="success"
            description="Tổng số học sinh"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bài kiểm tra"
            value={stats.pendingTests}
            icon={<AssignmentIcon />}
            color="warning"
            description="Sắp diễn ra"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chấm điểm"
            value={stats.gradingTasks}
            icon={<GradeIcon />}
            color="error"
            description="Cần hoàn thành"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Lớp học của tôi */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              p: 3,
              height: '400px',
              overflow: 'auto'
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
              <ClassIcon sx={{ mr: 1, color: 'primary.main' }} />
              Lớp học của tôi
            </Typography>
            <List>
              {mockData.classes.map((cls, index) => (
                <React.Fragment key={cls.id}>
                  <ListItem
                    sx={{
                      borderRadius: '10px',
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <ClassIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="600">
                          {cls.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {cls.students} học sinh
                          </Typography>
                          <Chip 
                            label={`Tiết tiếp theo: ${new Date(cls.nextSession).toLocaleString('vi-VN')}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mockData.classes.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Bài kiểm tra sắp tới */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              p: 3,
              height: '400px',
              overflow: 'auto'
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
              <AssignmentIcon sx={{ mr: 1, color: 'warning.main' }} />
              Bài kiểm tra sắp tới
            </Typography>
            <List>
              {mockData.upcomingTests.map((test, index) => (
                <React.Fragment key={test.id}>
                  <ListItem
                    sx={{
                      borderRadius: '10px',
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 152, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.light' }}>
                        <AssignmentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="600">
                          {test.testName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Lớp: {test.className}
                          </Typography>
                          <Box display="flex" gap={1} mt={0.5}>
                            <Chip 
                              label={`${new Date(test.date).toLocaleDateString('vi-VN')}`}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                            <Chip 
                              label={`Hệ số: ${test.coefficient}`}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mockData.upcomingTests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Hoạt động gần đây */}
        <Grid item xs={12}>
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
            <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
              <ScheduleIcon sx={{ mr: 1, color: 'info.main' }} />
              Hoạt động gần đây
            </Typography>
            <List>
              {mockData.recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem
                    sx={{
                      borderRadius: '10px',
                      '&:hover': {
                        bgcolor: 'rgba(33, 150, 243, 0.04)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.message}
                      secondary={activity.time}
                    />
                  </ListItem>
                  {index < mockData.recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TeacherDashboard;
