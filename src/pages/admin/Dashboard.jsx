import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Class,
  MonetizationOn,
  EventNote,
  Warning,
  CheckCircle,
  School,
  Payment
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import dayjs from 'dayjs';

import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  getStudents,
  getClasses,
  getPayments,
  getAttendance,
  getUnpaidStudents,
  getAbsentStudents,
  getEnrollments
} from '../../services/supabase/database';
import PageHeader from '../../components/common/PageHeader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Dashboard() {
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalRevenue: 0,
    attendanceRate: 0,
    unpaidCount: 0,
    absentCount: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [absentStudents, setAbsentStudents] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Lấy dữ liệu cơ bản
      const [
        { data: studentsData, error: studentsError },
        { data: classesData, error: classesError },
        { data: paymentsData, error: paymentsError },
        { data: attendanceData, error: attendanceError },
        { data: enrollmentsData, error: enrollmentsError }
      ] = await Promise.all([
        getStudents(),
        getClasses(),
        getPayments(),
        getAttendance(),
        getEnrollments()
      ]);
      
      if (studentsError) throw studentsError;
      if (classesError) throw classesError;
      if (paymentsError) throw paymentsError;
      if (attendanceError) throw attendanceError;
      if (enrollmentsError) throw enrollmentsError;
      
      // Tính toán thống kê
      const totalStudents = studentsData?.length || 0;
      const totalClasses = classesData?.length || 0;
      const activeClasses = classesData?.filter(c => c.is_active).length || 0;
      
      // Tính tổng doanh thu
      const totalRevenue = paymentsData
        ?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0) || 0;
      
      // Tính tỷ lệ điểm danh
      const totalAttendance = attendanceData?.length || 0;
      const presentCount = attendanceData?.filter(a => a.status).length || 0;
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance * 100).toFixed(1) : 0;
      
      // Lấy dữ liệu học sinh chưa đóng tiền và vắng nhiều
      const { data: unpaidData } = await getUnpaidStudents();
      const { data: absentData } = await getAbsentStudents(3);
      
      setStats({
        totalStudents,
        totalClasses,
        activeClasses,
        totalRevenue,
        attendanceRate,
        unpaidCount: unpaidData?.length || 0,
        absentCount: absentData?.length || 0
      });
      
      setUnpaidStudents(unpaidData?.slice(0, 5) || []);
      setAbsentStudents(absentData?.slice(0, 5) || []);
      
      // Thanh toán gần đây
      const recentPayments = paymentsData
        ?.sort((a, b) => dayjs(b.payment_date).diff(dayjs(a.payment_date)))
        .slice(0, 5) || [];
      
      setRecentPayments(recentPayments);
      
      // Dữ liệu cho biểu đồ
      const classStats = classesData?.reduce((acc, c) => {
        const subject = c.subject?.name || 'Khác';
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {});
      
      const pieData = Object.entries(classStats || {}).map(([name, value]) => ({
        name,
        value
      }));
      
      setChartData(pieData);
      
      // Hoạt động gần đây
      const activities = [
        ...recentPayments.map(p => ({
          type: 'payment',
          description: `${p.students?.full_name} đã thanh toán ${p.amount.toLocaleString('vi-VN')} VNĐ`,
          time: dayjs(p.payment_date).fromNow(),
          icon: <Payment color="success" />
        })),
        ...enrollmentsData?.slice(0, 3).map(e => ({
          type: 'enrollment',
          description: `${e.students?.full_name} đã đăng ký lớp ${e.classes?.name}`,
          time: dayjs(e.enrolled_at).fromNow(),
          icon: <School color="primary" />
        }))
      ].sort((a, b) => dayjs(b.time).diff(dayjs(a.time))).slice(0, 8);
      
      setRecentActivities(activities);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Lỗi khi tải dữ liệu dashboard: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const StatCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light` }}>
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            {trend > 0 ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
              {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <PageHeader 
        title={`Chào mừng, ${user?.user_metadata?.full_name || 'Admin'}!`} 
        breadcrumbs={[
          { label: 'Trang chủ', link: '/admin' }
        ]} 
      />
      
      {/* Thống kê tổng quan */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng số học sinh"
            value={stats.totalStudents}
            subtitle="Đang hoạt động"
            icon={<People />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng số lớp học"
            value={stats.totalClasses}
            subtitle={`${stats.activeClasses} lớp đang mở`}
            icon={<Class />}
            color="info"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Doanh thu"
            value={`${stats.totalRevenue.toLocaleString('vi-VN')} VNĐ`}
            subtitle="Tổng thu nhập"
            icon={<MonetizationOn />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tỷ lệ điểm danh"
            value={`${stats.attendanceRate}%`}
            subtitle="Trung bình tất cả lớp"
            icon={<EventNote />}
            color="warning"
          />
        </Grid>
      </Grid>
      
      {/* Cảnh báo */}
      {(stats.unpaidCount > 0 || stats.absentCount > 0) && (
        <Grid container spacing={3} mb={3}>
          {stats.unpaidCount > 0 && (
            <Grid item xs={12} md={6}>
              <Alert severity="warning" icon={<Warning />}>
                Có {stats.unpaidCount} học sinh chưa đóng học phí
              </Alert>
            </Grid>
          )}
          
          {stats.absentCount > 0 && (
            <Grid item xs={12} md={6}>
              <Alert severity="error" icon={<Warning />}>
                Có {stats.absentCount} học sinh vắng học nhiều buổi
              </Alert>
            </Grid>
          )}
        </Grid>
      )}
      
      <Grid container spacing={3}>
        {/* Biểu đồ phân bố lớp học */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân bố lớp học theo môn
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Thanh toán gần đây */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thanh toán gần đây
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Học sinh</TableCell>
                      <TableCell>Lớp học</TableCell>
                      <TableCell align="right">Số tiền</TableCell>
                      <TableCell>Ngày thanh toán</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.students?.full_name}</TableCell>
                        <TableCell>{payment.classes?.name}</TableCell>
                        <TableCell align="right">{payment.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                        <TableCell>{dayjs(payment.payment_date).format('DD/MM/YYYY')}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={payment.status === 'completed' ? 'Đã thanh toán' : 'Đang xử lý'}
                            color={payment.status === 'completed' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="outlined" href="/admin/payments">
                  Xem tất cả
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Học sinh cần chú ý */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Học sinh chưa đóng học phí
              </Typography>
              <List>
                {unpaidStudents.map((student) => (
                  <ListItem key={`${student.id}-${student.class_id}`}>
                    <ListItemAvatar>
                      <Avatar>
                        {student.full_name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.full_name}
                      secondary={`${student.class_name} - ${student.amount_due.toLocaleString('vi-VN')} VNĐ`}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="outlined" href="/admin/reports">
                  Xem chi tiết
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Học sinh vắng nhiều */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Học sinh vắng học nhiều
              </Typography>
              <List>
                {absentStudents.map((student) => (
                  <ListItem key={`${student.id}-${student.class_id}`}>
                    <ListItemAvatar>
                      <Avatar>
                        {student.full_name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.full_name}
                      secondary={`${student.class_name} - ${student.absent_count} buổi vắng`}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="outlined" href="/admin/reports">
                  Xem chi tiết
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
