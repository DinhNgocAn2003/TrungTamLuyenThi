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
import { getTeacherByUserId, getClassesForTeacher } from '../../services/supabase/teachers';
import ClassDetailDialog from '../../components/common/ClassDetailDialog';

// Dashboard now shows real aggregated overview (classes & total students)

function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalClasses: 0 });
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
  const { data: teacherRow } = await getTeacherByUserId(user.id);
  if (!teacherRow?.id) { setClasses([]); setStats({ totalClasses: 0 }); return; }
  // Không cần học sinh => giảm payload
  const { data: tClasses } = await getClassesForTeacher(teacherRow.id, { includeStudents: false, includeTeachers: true });
        setClasses(tClasses || []);
  setStats({ totalClasses: tClasses?.length || 0 });
      } finally { setLoading(false); }
    };
    load();
  }, [user?.id]);

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
        <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
          Chào mừng trở lại, {user?.user_metadata?.full_name || 'Giáo viên'}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {loading ? 'Đang tải dữ liệu tổng quan...' : `Bạn đang phụ trách ${stats.totalClasses} lớp`}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Tổng lớp học"
            value={stats.totalClasses}
            icon={<ClassIcon />}
            color="primary"
            description="Số lớp đang giảng dạy"
          />
        </Grid>
      </Grid>
      {/* Chỉ tổng quan: danh sách lớp rút gọn */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p:3, borderRadius: '20px', background:'rgba(255,255,255,0.9)', backdropFilter:'blur(20px)' }}>
            <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
              <ClassIcon sx={{ mr:1, color:'primary.main' }} /> Lớp học phụ trách
            </Typography>
            <List>
              {classes.map((cls, idx) => (
                <React.Fragment key={cls.id}>
                  <ListItem onClick={()=>{ setSelectedClass(cls); setDialogOpen(true); }} sx={{ cursor:'pointer', borderRadius:'10px', '&:hover':{ bgcolor:'rgba(25,118,210,0.06)' } }}>
                    <ListItemAvatar><Avatar sx={{ bgcolor:'primary.light' }}><ClassIcon /></Avatar></ListItemAvatar>
                    <ListItemText
                      primary={cls.name}
                      secondary={(() => {
                        const parts = [];
                        const teachers = (cls.teachers_list||[]).map(t => t.full_name).filter(Boolean);
                        if (teachers.length) parts.push('GV: ' + teachers.join(', '));
                        const sch = cls.schedule_list && cls.schedule_list[0];
                        if (sch) {
                          const st = sch.start_time?.slice(0,5) || '--:--';
                          const et = sch.end_time?.slice(0,5) || '--:--';
                          parts.push(`Thứ ${sch.day_of_week} ${st}-${et}`);
                        }
                        return parts.join(' • ') || '—';
                      })()}
                    />
                  </ListItem>
                  {idx < classes.length -1 && <Divider />}
                </React.Fragment>
              ))}
              {!loading && !classes.length && <Typography variant="body2">Chưa có lớp được phân công.</Typography>}
            </List>
          </Paper>
        </Grid>
      </Grid>
      <ClassDetailDialog open={dialogOpen} onClose={()=>{ setDialogOpen(false); setSelectedClass(null); }} classItem={selectedClass} />
    </Box>
  );
}

export default TeacherDashboard;
