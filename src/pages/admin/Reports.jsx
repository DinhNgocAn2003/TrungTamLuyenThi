import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Alert,
  TextField,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  PersonOff as PersonOffIcon,
  FilterList as FilterListIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  MonetizationOn as MonetizationOnIcon,
  EventNote as EventNoteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import { 
  getStudents, 
  getClasses, 
  getPayments, 
  getAttendance, 
  getEnrollments 
} from '../../services/supabase/database';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';

// Colors for charts
const COLORS = ['#5c9bd5', '#70a288', '#81c784', '#f48fb1', '#ffb74d', '#64b5f6'];

function Reports() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState('attendance');
  const [reportPeriod, setReportPeriod] = useState('day');
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedClass, setSelectedClass] = useState('');
  const [minAbsences, setMinAbsences] = useState(3);
  
  // Data states
  const [classes, setClasses] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalClasses: 0,
    activeClasses: 0,
    totalRevenue: 0,
    attendanceRate: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState({ pieData: [], timeData: [] });
  const [absentStudents, setAbsentStudents] = useState([]);
  const [unpaidStudents, setUnpaidStudents] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      fetchReportData();
    } else {
      fetchProblemStudents();
    }
  }, [tabValue, reportType, reportPeriod, startDate, endDate, selectedClass, minAbsences]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes, paymentsRes, enrollmentsRes, attendanceRes] = await Promise.all([
        getStudents(),
        getClasses(),
        getPayments(),
        getEnrollments(),
        getAttendance()
      ]);

      const students = studentsRes.data || [];
      const classesData = classesRes.data || [];
      const payments = paymentsRes.data || [];
      const enrollments = enrollmentsRes.data || [];
      const attendance = attendanceRes.data || [];

      setClasses(classesData);

      // Calculate summary stats
      const activeStudents = students.filter(s => s.is_active).length;
      const activeClasses = classesData.filter(c => c.is_active).length;
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalAttendanceRecords = attendance.length;
      const presentRecords = attendance.filter(a => a.status === 'present').length;
      const attendanceRate = totalAttendanceRecords > 0 
        ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
        : 0;

      setSummaryStats({
        totalStudents: students.length,
        activeStudents,
        totalClasses: classesData.length,
        activeClasses,
        totalRevenue,
        attendanceRate
      });

    } catch (error) {
      console.error('Error fetching initial data:', error);
      showNotification('Lỗi khi tải dữ liệu ban đầu: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const startDateString = startDate.format('YYYY-MM-DD');
      const endDateString = endDate.format('YYYY-MM-DD');

      if (reportType === 'attendance') {
        const { data } = await getAttendance();
        await fetchAttendanceReport(startDateString, endDateString, data || []);
      } else if (reportType === 'payment') {
        const { data } = await getPayments();
        await fetchPaymentReport(startDateString, endDateString, data || []);
      } else if (reportType === 'enrollment') {
        const { data } = await getEnrollments();
        await fetchEnrollmentReport(startDateString, endDateString, data || []);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      showNotification('Lỗi khi tải dữ liệu báo cáo: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceReport = async (startDateString, endDateString, attendanceData) => {
    try {
      // Filter data based on date range and class
      let filteredData = attendanceData.filter(a => 
        dayjs(a.date).isBetween(startDateString, endDateString, null, '[]')
      );
      
      if (selectedClass) {
        filteredData = filteredData.filter(a => a.class_id === selectedClass);
      }
      
      // Group data by time period
      const groupedData = {};
      
      filteredData.forEach(a => {
        let key;
        const date = dayjs(a.date);
        
        if (reportPeriod === 'day') {
          key = date.format('YYYY-MM-DD');
        } else if (reportPeriod === 'week') {
          key = `Tuần ${date.week()} - ${date.year()}`;
        } else if (reportPeriod === 'month') {
          key = date.format('MM/YYYY');
        }
        
        if (!groupedData[key]) {
          groupedData[key] = { present: 0, absent: 0 };
        }
        
        if (a.status === 'present') {
          groupedData[key].present += 1;
        } else {
          groupedData[key].absent += 1;
        }
      });
      
      // Convert to array for chart
      const chartData = Object.keys(groupedData).map(key => ({
        name: key,
        present: groupedData[key].present,
        absent: groupedData[key].absent
      }));
      
      // Sort by time
      chartData.sort((a, b) => {
        if (reportPeriod === 'day') {
          return dayjs(a.name).diff(dayjs(b.name));
        } else if (reportPeriod === 'week') {
          const aWeek = a.name.split(' ')[1];
          const bWeek = b.name.split(' ')[1];
          return aWeek - bWeek;
        } else {
          const aDate = dayjs('01/' + a.name, 'DD/MM/YYYY');
          const bDate = dayjs('01/' + b.name, 'DD/MM/YYYY');
          return aDate.diff(bDate);
        }
      });
      
      setAttendanceData(chartData);
      
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      throw error;
    }
  };

  const fetchPaymentReport = async (startDateString, endDateString, paymentsData) => {
    try {
      // Filter completed payments in date range
      let filteredData = paymentsData.filter(p => 
        p.status === 'completed' && 
        dayjs(p.payment_date).isBetween(startDateString, endDateString, null, '[]')
      );
      
      if (selectedClass) {
        filteredData = filteredData.filter(p => p.class_id === selectedClass);
      }
      
      // Group data by time period
      const groupedData = {};
      
      filteredData.forEach(p => {
        let key;
        const date = dayjs(p.payment_date);
        
        if (reportPeriod === 'day') {
          key = date.format('YYYY-MM-DD');
        } else if (reportPeriod === 'week') {
          key = `Tuần ${date.week()} - ${date.year()}`;
        } else if (reportPeriod === 'month') {
          key = date.format('MM/YYYY');
        }
        
        if (!groupedData[key]) {
          groupedData[key] = { cash: 0, transfer: 0, total: 0 };
        }
        
        groupedData[key].total += p.amount;
        
        if (p.payment_method === 'cash') {
          groupedData[key].cash += p.amount;
        } else {
          groupedData[key].transfer += p.amount;
        }
      });
      
      // Convert to array for chart
      const chartData = Object.keys(groupedData).map(key => ({
        name: key,
        cash: groupedData[key].cash,
        transfer: groupedData[key].transfer,
        total: groupedData[key].total
      }));
      
      // Sort by time
      chartData.sort((a, b) => {
        if (reportPeriod === 'day') {
          return dayjs(a.name).diff(dayjs(b.name));
        } else if (reportPeriod === 'week') {
          const aWeek = a.name.split(' ')[1];
          const bWeek = b.name.split(' ')[1];
          return aWeek - bWeek;
        } else {
          const aDate = dayjs('01/' + a.name, 'DD/MM/YYYY');
          const bDate = dayjs('01/' + b.name, 'DD/MM/YYYY');
          return aDate.diff(bDate);
        }
      });
      
      setPaymentData(chartData);
      
    } catch (error) {
      console.error('Error fetching payment report:', error);
      throw error;
    }
  };

  const fetchEnrollmentReport = async (startDateString, endDateString, enrollmentsData) => {
    try {
      // Filter by date range and class
      let filteredData = enrollmentsData.filter(e => 
        dayjs(e.enrolled_at).isBetween(startDateString, endDateString, null, '[]')
      );
      
      if (selectedClass) {
        filteredData = filteredData.filter(e => e.class_id === selectedClass);
      }
      
      // Group by class for pie chart
      const groupedByClass = {};
      
      filteredData.forEach(e => {
        const className = e.classes?.name || 'Không xác định';
        
        if (!groupedByClass[className]) {
          groupedByClass[className] = 0;
        }
        
        groupedByClass[className] += 1;
      });
      
      // Convert to array for pie chart
      const classPieData = Object.keys(groupedByClass).map(key => ({
        name: key,
        value: groupedByClass[key]
      }));
      
      // Group by time for line chart
      const groupedByTime = {};
      
      filteredData.forEach(e => {
        let key;
        const date = dayjs(e.enrolled_at);
        
        if (reportPeriod === 'day') {
          key = date.format('YYYY-MM-DD');
        } else if (reportPeriod === 'week') {
          key = `Tuần ${date.week()} - ${date.year()}`;
        } else if (reportPeriod === 'month') {
          key = date.format('MM/YYYY');
        }
        
        if (!groupedByTime[key]) {
          groupedByTime[key] = 0;
        }
        
        groupedByTime[key] += 1;
      });
      
      // Convert to array for time chart
      const timeChartData = Object.keys(groupedByTime).map(key => ({
        name: key,
        enrollments: groupedByTime[key]
      }));
      
      // Sort by time
      timeChartData.sort((a, b) => {
        if (reportPeriod === 'day') {
          return dayjs(a.name).diff(dayjs(b.name));
        } else if (reportPeriod === 'week') {
          const aWeek = a.name.split(' ')[1];
          const bWeek = b.name.split(' ')[1];
          return aWeek - bWeek;
        } else {
          const aDate = dayjs('01/' + a.name, 'DD/MM/YYYY');
          const bDate = dayjs('01/' + b.name, 'DD/MM/YYYY');
          return aDate.diff(bDate);
        }
      });
      
      setEnrollmentData({ pieData: classPieData, timeData: timeChartData });
      
    } catch (error) {
      console.error('Error fetching enrollment report:', error);
      throw error;
    }
  };

  const fetchProblemStudents = async () => {
    setLoading(true);
    try {
      // Placeholder for actual API calls
      const absentStudents = [];
      const unpaidStudents = [];
      
      setAbsentStudents(absentStudents.filter(s => s.absent_count >= minAbsences));
      setUnpaidStudents(unpaidStudents);
      
    } catch (error) {
      console.error('Error fetching problem students:', error);
      showNotification('Lỗi khi tải danh sách học sinh có vấn đề: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (studentId, type, className) => {
    setLoading(true);
    try {
      let message = '';
      
      if (type === 'absence') {
        message = `Thông báo: Học sinh của bạn đã vắng mặt nhiều buổi học tại lớp ${className}. Vui lòng liên hệ với trung tâm để biết thêm chi tiết.`;
      } else if (type === 'payment') {
        message = `Thông báo: Học sinh của bạn cần đóng học phí cho lớp ${className}. Vui lòng thanh toán trong thời gian sớm nhất.`;
      }
      
      // Mock sending notification - replace with actual API call
      console.log('Sending notification:', { studentId, type, message });
      
      showNotification('Đã gửi thông báo thành công', 'success');
    } catch (error) {
      console.error('Error sending notification:', error);
      showNotification('Lỗi khi gửi thông báo: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    try {
      let data = [];
      let filename = '';
      
      if (reportType === 'attendance') {
        data = attendanceData.map(item => ({
          'Thời gian': item.name,
          'Có mặt': item.present,
          'Vắng mặt': item.absent,
          'Tỷ lệ đi học (%)': item.present + item.absent > 0 
            ? ((item.present / (item.present + item.absent)) * 100).toFixed(1) 
            : '0'
        }));
        filename = 'bao-cao-diem-danh';
      } else if (reportType === 'payment') {
        data = paymentData.map(item => ({
          'Thời gian': item.name,
          'Tiền mặt (VNĐ)': item.cash.toLocaleString('vi-VN'),
          'Chuyển khoản (VNĐ)': item.transfer.toLocaleString('vi-VN'),
          'Tổng cộng (VNĐ)': item.total.toLocaleString('vi-VN')
        }));
        filename = 'bao-cao-thanh-toan';
      } else if (reportType === 'enrollment') {
        data = enrollmentData.timeData.map(item => ({
          'Thời gian': item.name,
          'Số lượt đăng ký': item.enrollments
        }));
        filename = 'bao-cao-dang-ky';
      }
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');
      
      // Export file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      FileSaver.saveAs(blob, `${filename}_${startDate.format('YYYYMMDD')}_${endDate.format('YYYYMMDD')}.xlsx`);
      
      showNotification('Đã xuất báo cáo thành công', 'success');
    } catch (error) {
      console.error('Error exporting report:', error);
      showNotification('Lỗi khi xuất báo cáo: ' + error.message, 'error');
    }
  };

  const handleExportProblemStudents = (type) => {
    try {
      let data = [];
      let filename = '';
      
      if (type === 'absent') {
        data = absentStudents.map(student => ({
          'Họ và tên': student.full_name,
          'Lớp học': student.class_name,
          'Số buổi vắng': student.absent_count
        }));
        filename = 'danh-sach-hoc-sinh-vang-nhieu';
      } else if (type === 'unpaid') {
        data = unpaidStudents.map(student => ({
          'Họ và tên': student.full_name,
          'Lớp học': student.class_name,
          'Số tiền nợ (VNĐ)': student.amount_due.toLocaleString('vi-VN')
        }));
        filename = 'danh-sach-hoc-sinh-chua-dong-tien';
      }
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách');
      
      // Export file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      FileSaver.saveAs(blob, `${filename}_${dayjs().format('YYYYMMDD')}.xlsx`);
      
      showNotification('Đã xuất danh sách thành công', 'success');
    } catch (error) {
      console.error('Error exporting problem students:', error);
      showNotification('Lỗi khi xuất danh sách: ' + error.message, 'error');
    }
  };

  const renderReportChart = () => {
    if (reportType === 'attendance') {
      return (
        <Box sx={{ height: 400, mt: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={attendanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)} />
              <Legend />
              <Bar dataKey="present" name="Có mặt" fill="#81c784" />
              <Bar dataKey="absent" name="Vắng mặt" fill="#e57373" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      );
    } else if (reportType === 'payment') {
      return (
        <Box sx={{ height: 400, mt: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={paymentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'} />
              <Legend />
              <Line type="monotone" dataKey="cash" name="Tiền mặt" stroke="#5c9bd5" />
              <Line type="monotone" dataKey="transfer" name="Chuyển khoản" stroke="#ffb74d" />
              <Line type="monotone" dataKey="total" name="Tổng cộng" stroke="#81c784" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      );
    } else if (reportType === 'enrollment') {
      return (
        <Grid container spacing={4} mt={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" align="center" gutterBottom>
              Phân bố đăng ký theo lớp
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enrollmentData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {enrollmentData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' học sinh'} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" align="center" gutterBottom>
              Số lượt đăng ký theo thời gian
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={enrollmentData.timeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' học sinh'} />
                  <Bar dataKey="enrollments" name="Số lượt đăng ký" fill="#5c9bd5" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      );
    }
    
    return null;
  };

  return (
    <Box>
      <PageHeader 
        title="Báo cáo và thống kê" 
        breadcrumbs={[
          { label: 'Trang chủ', link: '/admin' },
          { label: 'Báo cáo và thống kê' }
        ]} 
      />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<AssessmentIcon />} label="Báo cáo chi tiết" />
          <Tab icon={<PersonOffIcon />} label="Danh sách vấn đề" />
        </Tabs>
      </Box>
      
      {/* Tab báo cáo chi tiết */}
      {tabValue === 0 && (
        <>
          {/* Thẻ thống kê tổng quan */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Học sinh
                      </Typography>
                      <Typography variant="h5">
                        {summaryStats.totalStudents}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {summaryStats.activeStudents} đang học
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <PeopleIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Lớp học
                      </Typography>
                      <Typography variant="h5">
                        {summaryStats.totalClasses}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {summaryStats.activeClasses} đang mở
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'info.light' }}>
                      <ClassIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Doanh thu
                      </Typography>
                      <Typography variant="h5">
                        {summaryStats.totalRevenue.toLocaleString('vi-VN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        VNĐ (trong kỳ)
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <MonetizationOnIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tỷ lệ đi học
                      </Typography>
                      <Typography variant="h5">
                        {summaryStats.attendanceRate}%
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" color={summaryStats.attendanceRate >= 80 ? 'success.main' : 'error.main'}>
                          {summaryStats.attendanceRate >= 80 ? 'Tốt' : 'Cần cải thiện'}
                        </Typography>
                        {summaryStats.attendanceRate >= 80 ? 
                          <TrendingUpIcon fontSize="small" color="success" sx={{ ml: 0.5 }} /> : 
                          <TrendingDownIcon fontSize="small" color="error" sx={{ ml: 0.5 }} />
                        }
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'warning.light' }}>
                      <EventNoteIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Bộ lọc báo cáo */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <FilterListIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Bộ lọc báo cáo</Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Loại báo cáo</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Loại báo cáo"
                  >
                    <MenuItem value="attendance">Báo cáo điểm danh</MenuItem>
                    <MenuItem value="payment">Báo cáo thu chi</MenuItem>
                    <MenuItem value="enrollment">Báo cáo đăng ký</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Thời gian</InputLabel>
                  <Select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    label="Thời gian"
                  >
                    <MenuItem value="day">Theo ngày</MenuItem>
                    <MenuItem value="week">Theo tuần</MenuItem>
                    <MenuItem value="month">Theo tháng</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Từ ngày"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Đến ngày"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Lớp học</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    label="Lớp học"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {classes.map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={12} display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportReport}
                >
                  Xuất báo cáo
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Biểu đồ báo cáo */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {reportType === 'attendance' 
                ? 'Báo cáo điểm danh' 
                : reportType === 'payment' 
                  ? 'Báo cáo thu chi' 
                  : 'Báo cáo đăng ký'}
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {(reportType === 'attendance' && attendanceData.length === 0) ||
             (reportType === 'payment' && paymentData.length === 0) ||
             (reportType === 'enrollment' && enrollmentData.pieData.length === 0) ? (
              <Alert severity="info" sx={{ my: 2 }}>
                Không có dữ liệu trong khoảng thời gian đã chọn
              </Alert>
            ) : (
              renderReportChart()
            )}
          </Paper>
        </>
      )}
      
      {/* Tab danh sách vấn đề */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Danh sách học sinh vắng nhiều */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Học sinh vắng nhiều buổi
                </Typography>
                <Box>
                  <TextField
                    label="Số buổi vắng tối thiểu"
                    type="number"
                    size="small"
                    value={minAbsences}
                    onChange={(e) => setMinAbsences(Math.max(1, parseInt(e.target.value) || 1))}
                    sx={{ width: 180, mr: 1 }}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportProblemStudents('absent')}
                  >
                    Xuất Excel
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {absentStudents.length > 0 ? (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Học sinh</TableCell>
                        <TableCell>Lớp học</TableCell>
                        <TableCell align="center">Số buổi vắng</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {absentStudents.map((student) => (
                        <TableRow key={`${student.id}-${student.class_id}`}>
                          <TableCell>{student.full_name}</TableCell>
                          <TableCell>{student.class_name}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={student.absent_count} 
                              color={student.absent_count >= 5 ? 'error' : 'warning'} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              startIcon={<NotificationsIcon />}
                              onClick={() => handleSendNotification(student.id, 'absence', student.class_name)}
                            >
                              Thông báo
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="success">
                  Không có học sinh nào vắng quá {minAbsences} buổi
                </Alert>
              )}
            </Paper>
          </Grid>
          
          {/* Danh sách học sinh chưa đóng tiền */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Học sinh chưa đóng học phí
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExportProblemStudents('unpaid')}
                >
                  Xuất Excel
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {unpaidStudents.length > 0 ? (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Học sinh</TableCell>
                        <TableCell>Lớp học</TableCell>
                        <TableCell align="right">Số tiền nợ</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unpaidStudents.map((student) => (
                        <TableRow key={`${student.id}-${student.class_id}`}>
                          <TableCell>{student.full_name}</TableCell>
                          <TableCell>{student.class_name}</TableCell>
                          <TableCell align="right">
                            {student.amount_due.toLocaleString('vi-VN')} VNĐ
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              startIcon={<NotificationsIcon />}
                              onClick={() => handleSendNotification(student.id, 'payment', student.class_name)}
                            >
                              Thông báo
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="success">
                  Tất cả học sinh đã đóng học phí đầy đủ
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Reports;
