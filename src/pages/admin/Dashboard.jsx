import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  School,
  Person,
  Payment,
  Event,
  Assignment
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudents, getClasses, getPayments, getEnrollments } from '../../services/supabase/database';
import { useLoading } from '../../contexts/LoadingContext';
import PageHeader from '../../components/common/PageHeader';

function Dashboard() {
  const { setLoading } = useLoading();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalRevenue: 0,
    activeEnrollments: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all required data
      const [studentsRes, classesRes, paymentsRes, enrollmentsRes] = await Promise.all([
        getStudents(),
        getClasses(),
        getPayments(),
        getEnrollments()
      ]);

      // Calculate statistics
      const totalStudents = studentsRes.data?.length || 0;
      const totalClasses = classesRes.data?.length || 0;
      const totalRevenue = paymentsRes.data?.reduce((sum, payment) => 
        payment.status === 'completed' ? sum + payment.amount : sum, 0) || 0;
      const activeEnrollments = enrollmentsRes.data?.filter(e => e.status === 'active').length || 0;

      setStats({
        totalStudents,
        totalClasses,
        totalRevenue,
        activeEnrollments
      });

      // Prepare chart data (last 6 months revenue)
      const monthlyRevenue = generateMonthlyRevenue(paymentsRes.data || []);
      setChartData(monthlyRevenue);

      // Recent activities
      const activities = generateRecentActivities(enrollmentsRes.data || [], paymentsRes.data || []);
      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyRevenue = (payments) => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      const monthRevenue = payments
        .filter(p => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate.getMonth() === date.getMonth() && 
                 paymentDate.getFullYear() === date.getFullYear() &&
                 p.status === 'completed';
        })
        .reduce((sum, p) => sum + p.amount, 0);

      months.push({
        month: monthYear,
        revenue: monthRevenue
      });
    }
    return months;
  };

  const generateRecentActivities = (enrollments, payments) => {
    const activities = [];
    
    // Recent enrollments
    enrollments.slice(0, 5).forEach(enrollment => {
      activities.push({
        type: 'enrollment',
        message: `${enrollment.students?.full_name || 'N/A'} đăng ký lớp ${enrollment.classes?.name || 'N/A'}`,
        time: enrollment.enrolled_at,
        icon: <School />
      });
    });

    // Recent payments
    payments.slice(0, 5).forEach(payment => {
      activities.push({
        type: 'payment',
        message: `Thanh toán ${payment.amount.toLocaleString('vi-VN')} VNĐ cho lớp ${payment.classes?.name || 'N/A'}`,
        time: payment.payment_date,
        icon: <Payment />
      });
    });

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {typeof value === 'number' && title.includes('Doanh thu') 
                ? `${value.toLocaleString('vi-VN')} VNĐ`
                : value.toLocaleString('vi-VN')
              }
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <PageHeader 
        title="Dashboard" 
        breadcrumbs={[
          { label: 'Trang chủ' }
        ]} 
      />

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng học sinh"
            value={stats.totalStudents}
            icon={<Person fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng lớp học"
            value={stats.totalClasses}
            icon={<School fontSize="large" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Doanh thu tổng"
            value={stats.totalRevenue}
            icon={<Payment fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đăng ký đang hoạt động"
            value={stats.activeEnrollments}
            icon={<Assignment fontSize="large" />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Doanh thu 6 tháng gần đây
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`} />
                <Line type="monotone" dataKey="revenue" stroke="#5c9bd5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Hoạt động gần đây
            </Typography>
            <List sx={{ maxHeight: 320, overflow: 'auto' }}>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {activity.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.message}
                    secondary={new Date(activity.time).toLocaleDateString('vi-VN')}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
