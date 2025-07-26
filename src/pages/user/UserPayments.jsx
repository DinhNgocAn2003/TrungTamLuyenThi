import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  MonetizationOn as MonetizationOnIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  getStudentByUserId,
  getPayments,
  getUnpaidStudents
} from '../../services/supabase/database';

function UserPayments() {
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [unpaidClasses, setUnpaidClasses] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptDialog, setReceiptDialog] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchPaymentData();
    }
  }, [user]);
  
  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // Lấy thông tin học sinh
      const { data: studentData, error: studentError } = await getStudentByUserId(user.id);
      if (studentError) throw studentError;
      
      if (!studentData) {
        showNotification('Không tìm thấy thông tin học sinh', 'error');
        return;
      }
      
      setStudent(studentData);
      
      // Lấy lịch sử thanh toán
      const { data: paymentData, error: paymentError } = await getPayments(studentData.id);
      if (paymentError) throw paymentError;
      
      // Sắp xếp theo ngày thanh toán mới nhất
      const sortedPayments = paymentData?.sort((a, b) => 
        dayjs(b.payment_date).diff(dayjs(a.payment_date))
      ) || [];
      
      setPayments(sortedPayments);
      
      // Lấy danh sách lớp học chưa thanh toán
      const { data: unpaidData, error: unpaidError } = await getUnpaidStudents();
      if (unpaidError) throw unpaidError;
      
      // Lọc ra các lớp của học sinh hiện tại
      const studentUnpaid = unpaidData?.filter(item => item.student_id === studentData.id) || [];
      setUnpaidClasses(studentUnpaid);
      
    } catch (error) {
      console.error('Error fetching payment data:', error);
      showNotification('Lỗi khi tải dữ liệu thanh toán: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenReceiptDialog = (payment) => {
    setSelectedPayment(payment);
    setReceiptDialog(true);
  };
  
  const handleCloseReceiptDialog = () => {
    setReceiptDialog(false);
  };
  
  const getTotalPaid = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };
  
  const getTotalUnpaid = () => {
    return unpaidClasses.reduce((sum, c) => sum + (c.amount_due || c.tuition_fee || 0), 0);
  };

  const getMonthlyFee = (classItem) => {
    const totalFee = classItem.amount_due || classItem.tuition_fee || 0;
    return totalFee / 4; // Chia làm 4 tháng
  };

  const getUnpaidMonths = (classItem) => {
    // Tính số tháng chưa đóng dựa trên enrollment_date
    const enrollDate = dayjs(classItem.enrollment_date);
    const currentDate = dayjs();
    const monthsEnrolled = currentDate.diff(enrollDate, 'month') + 1;
    
    // Giả sử đã đóng một số tháng (có thể lấy từ database)
    const monthsPaid = 0; // Tạm thời set 0, cần logic từ database
    const unpaidMonths = Math.max(0, monthsEnrolled - monthsPaid);
    
    return Math.min(unpaidMonths, 4); // Tối đa 4 tháng
  };

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.9)' }}>
        <Box display="flex" alignItems="center" mb={3}>
          <MonetizationOnIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            Thanh toán học phí
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" mb={4}>
          Quản lý và theo dõi tình hình thanh toán học phí theo từng tháng
        </Typography>
      </Paper>
      
      <Grid container spacing={4} mb={4}>
        {/* Tổng quan thanh toán */}
        <Grid item xs={12} lg={8}>
          <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 3
            }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                💰 Tổng quan thanh toán
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Thống kê chi tiết về tình hình tài chính học tập
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box 
                    textAlign="center" 
                    p={3} 
                    sx={{ 
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'success.light'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                      ✅ Đã thanh toán
                    </Typography>
                    <Typography variant="h4" color="success.dark" fontWeight="bold">
                      {getTotalPaid().toLocaleString('vi-VN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      VNĐ
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box 
                    textAlign="center" 
                    p={3} 
                    sx={{ 
                      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'error.light'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                      ⏳ Chưa thanh toán
                    </Typography>
                    <Typography variant="h4" color="error.dark" fontWeight="bold">
                      {getTotalUnpaid().toLocaleString('vi-VN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      VNĐ
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box 
                    textAlign="center" 
                    p={3} 
                    sx={{ 
                      background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'info.light'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                      📊 Tổng cộng
                    </Typography>
                    <Typography variant="h4" color="info.dark" fontWeight="bold">
                      {(getTotalPaid() + getTotalUnpaid()).toLocaleString('vi-VN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      VNĐ
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Thông tin chuyển khoản */}
        <Grid item xs={12} lg={4}>
          <Card elevation={4} sx={{ borderRadius: 3, height: '100%' }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 3
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🏦 Thông tin chuyển khoản
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'grey.50', 
                borderRadius: 2, 
                border: '1px dashed',
                borderColor: 'grey.300',
                mb: 2
              }}>
                <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalanceIcon sx={{ mr: 1, fontSize: 18 }} />
                  <strong>Ngân hàng:</strong> Techcombank
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography component="span" sx={{ mr: 1 }}>💳</Typography>
                  <strong>STK:</strong> 19036123456789
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography component="span" sx={{ mr: 1 }}>👤</Typography>
                  <strong>Chủ TK:</strong> TRUNG TÂM ABC
                </Typography>
              </Box>
              
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiAlert-message': { fontSize: '0.9rem' }
                }}
              >
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  📝 Nội dung chuyển khoản:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                  [Họ tên học sinh] - [Tên lớp] - Tháng [X]
                </Typography>
              </Alert>
              
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                Vui lòng chụp màn hình biên lai sau khi chuyển khoản!
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Danh sách lớp học và thanh toán theo tháng */}
      <Card elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          color: 'white',
          p: 3
        }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📚 Lớp học và thanh toán theo tháng
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Chi tiết học phí từng tháng cho các lớp học đã đăng ký
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 0 }}>
          {unpaidClasses.length > 0 ? (
            <Box>
              {unpaidClasses.map((classItem, index) => {
                const monthlyFee = getMonthlyFee(classItem);
                const unpaidMonths = getUnpaidMonths(classItem);
                const totalUnpaid = monthlyFee * unpaidMonths;
                
                return (
                  <Box 
                    key={classItem.class_id || classItem.id} 
                    sx={{ 
                      p: 3, 
                      borderBottom: index < unpaidClasses.length - 1 ? '1px solid' : 'none',
                      borderColor: 'grey.200',
                      '&:hover': {
                        bgcolor: 'grey.50'
                      }
                    }}
                  >
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                            {classItem.class_name}
                          </Typography>
                          <Chip 
                            icon={<EventNoteIcon />}
                            label={`Đăng ký: ${dayjs(classItem.enrollment_date).format('DD/MM/YYYY')}`}
                            variant="outlined"
                            size="small"
                            color="info"
                          />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center">
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Học phí mỗi tháng
                          </Typography>
                          <Typography variant="h6" color="primary.main" fontWeight="bold">
                            {monthlyFee.toLocaleString('vi-VN')} VNĐ
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {unpaidMonths} tháng chưa đóng
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box textAlign="right">
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Tổng cần thanh toán
                          </Typography>
                          <Typography variant="h5" color="error.main" fontWeight="bold">
                            {totalUnpaid.toLocaleString('vi-VN')} VNĐ
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<MonetizationOnIcon />}
                            sx={{ 
                              mt: 1,
                              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                            }}
                            onClick={() => {
                              // Logic thanh toán
                              showNotification(`Chuẩn bị thanh toán ${totalUnpaid.toLocaleString('vi-VN')} VNĐ cho ${classItem.class_name}`, 'info');
                            }}
                          >
                            Thanh toán
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {/* Timeline thanh toán theo tháng */}
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        📅 Lịch thanh toán theo tháng:
                      </Typography>
                      <Grid container spacing={1}>
                        {[1, 2, 3, 4].map((month) => {
                          const isPaid = month <= (4 - unpaidMonths);
                          const isCurrentMonth = month === (4 - unpaidMonths + 1);
                          
                          return (
                            <Grid item xs={3} key={month}>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  textAlign: 'center',
                                  bgcolor: isPaid ? 'success.light' : isCurrentMonth ? 'warning.light' : 'grey.100',
                                  color: isPaid ? 'success.dark' : isCurrentMonth ? 'warning.dark' : 'text.secondary',
                                  border: '2px solid',
                                  borderColor: isPaid ? 'success.main' : isCurrentMonth ? 'warning.main' : 'grey.300'
                                }}
                              >
                                <Typography variant="caption" fontWeight="bold">
                                  Tháng {month}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                  {isPaid ? '✅ Đã đóng' : isCurrentMonth ? '⏳ Cần đóng' : '❌ Chưa đóng'}
                                </Typography>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box p={4} textAlign="center">
              <Typography variant="h6" color="success.main" gutterBottom>
                🎉 Xuất sắc!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Bạn không có khoản học phí nào chưa thanh toán.
              </Typography>
              <Box mt={2}>
                <Chip 
                  icon={<CheckCircleIcon />}
                  label="Tài khoản đã được thanh toán đầy đủ"
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Lịch sử thanh toán */}
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3
        }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📋 Lịch sử thanh toán
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Theo dõi tất cả các giao dịch thanh toán đã thực hiện
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 0 }}>
          {payments.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mã biên lai</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số tiền</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày thanh toán</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Phương thức</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment, index) => (
                    <TableRow 
                      key={payment.id}
                      sx={{
                        '&:hover': { bgcolor: 'grey.50' },
                        bgcolor: index % 2 === 0 ? 'white' : 'grey.25'
                      }}
                    >
                      <TableCell>
                        <Chip 
                          label={payment.receipt_number || 'N/A'}
                          variant="outlined"
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {payment.classes?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="bold" color="primary.main">
                          {payment.amount.toLocaleString('vi-VN')} VNĐ
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dayjs(payment.payment_date).format('DD/MM/YYYY')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={payment.payment_method === 'cash' ? <MonetizationOnIcon /> : <AccountBalanceIcon />}
                          label={payment.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                          color={payment.payment_method === 'cash' ? 'primary' : 'info'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={
                            payment.status === 'completed' ? 'Đã thanh toán' : 
                            payment.status === 'pending' ? 'Đang xử lý' : 'Đã hủy'
                          }
                          color={
                            payment.status === 'completed' ? 'success' : 
                            payment.status === 'pending' ? 'warning' : 'error'
                          }
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReceiptIcon />}
                          onClick={() => handleOpenReceiptDialog(payment)}
                          sx={{ borderRadius: 2 }}
                        >
                          Biên lai
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box p={4} textAlign="center">
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📭 Chưa có lịch sử thanh toán
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Các giao dịch thanh toán sẽ hiển thị tại đây sau khi bạn thực hiện thanh toán.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog xem biên lai */}
      <Dialog 
        open={receiptDialog} 
        onClose={handleCloseReceiptDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🧾 Biên lai thanh toán
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Chi tiết giao dịch thanh toán học phí
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
              onClick={() => {
                showNotification('Tính năng đang phát triển', 'info');
              }}
            >
              Tải biên lai
            </Button>
          </Box>
        </Box>
        
        <DialogContent sx={{ p: 4 }}>
          {selectedPayment && (
            <Box>
              {/* Header thông tin */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: 'primary.light', 
                    borderRadius: 2,
                    color: 'primary.dark'
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📋 Mã biên lai
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedPayment.receipt_number || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: 'success.light', 
                    borderRadius: 2,
                    color: 'success.dark',
                    textAlign: 'right'
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📅 Ngày thanh toán
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {dayjs(selectedPayment.payment_date).format('DD/MM/YYYY')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ mb: 4 }} />
              
              {/* Thông tin chi tiết */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6}>
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      👤 Học sinh
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {student?.full_name || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      💳 Phương thức thanh toán
                    </Typography>
                    <Chip 
                      icon={selectedPayment.payment_method === 'cash' ? <MonetizationOnIcon /> : <AccountBalanceIcon />}
                      label={selectedPayment.payment_method === 'cash' ? '💰 Tiền mặt' : '🏦 Chuyển khoản'}
                      color={selectedPayment.payment_method === 'cash' ? 'primary' : 'info'}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      📚 Lớp học
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {selectedPayment.classes?.name || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      ⭐ Trạng thái
                    </Typography>
                    <Chip 
                      label={
                        selectedPayment.status === 'completed' 
                          ? '✅ Đã thanh toán' 
                          : selectedPayment.status === 'pending' 
                            ? '⏳ Đang xử lý' 
                            : '❌ Đã hủy'
                      }
                      color={
                        selectedPayment.status === 'completed' ? 'success' : 
                        selectedPayment.status === 'pending' ? 'warning' : 'error'
                      }
                      variant="filled"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Grid>
              </Grid>
              
              {/* Bảng chi tiết thanh toán */}
              <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>💰 Nội dung thanh toán</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>💵 Số tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Thanh toán học phí lớp <strong>{selectedPayment.classes?.name || 'N/A'}</strong>
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {selectedPayment.amount.toLocaleString('vi-VN')} VNĐ
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                        💯 Tổng thanh toán
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h5" color="primary.dark" fontWeight="bold">
                          {selectedPayment.amount.toLocaleString('vi-VN')} VNĐ
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              </Card>
              
              {/* Ghi chú */}
              {selectedPayment.notes && (
                <Box mb={3} p={3} bgcolor="grey.50" borderRadius={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    📝 Ghi chú
                  </Typography>
                  <Typography variant="body1">{selectedPayment.notes}</Typography>
                </Box>
              )}
              
              {/* Lưu ý */}
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ borderRadius: 2 }}
              >
                <Typography variant="body2" fontWeight="medium">
                  ℹ️ Biên lai này được tạo tự động từ hệ thống. 
                  Để biết thêm chi tiết, vui lòng liên hệ với quản trị viên.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Button 
            onClick={handleCloseReceiptDialog}
            variant="contained"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserPayments;
