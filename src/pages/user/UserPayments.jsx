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
  Info as InfoIcon
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
      const studentUnpaid = unpaidData?.filter(item => item.id === studentData.id) || [];
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
    return unpaidClasses.reduce((sum, c) => sum + c.amount_due, 0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Thanh toán học phí
      </Typography>
      
      <Grid container spacing={3} mb={3}>
        {/* Tổng quan thanh toán */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng quan thanh toán
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="primary.light" borderRadius={1}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Đã thanh toán
                    </Typography>
                    <Typography variant="h5" color="primary.dark">
                      {getTotalPaid().toLocaleString('vi-VN')} VNĐ
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="error.light" borderRadius={1}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Chưa thanh toán
                    </Typography>
                    <Typography variant="h5" color="error.dark">
                      {getTotalUnpaid().toLocaleString('vi-VN')} VNĐ
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Thông tin thanh toán
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Thông tin chuyển khoản:</strong>
                </Typography>
                <Typography variant="body2" component="div">
                  <ul style={{ paddingLeft: '1.5rem', marginTop: 0 }}>
                    <li>Ngân hàng: Techcombank</li>
                    <li>Số tài khoản: 19036123456789</li>
                    <li>Chủ tài khoản: TRUNG TÂM ABC</li>
                    <li>Nội dung: [Họ tên học sinh] - [Tên lớp]</li>
                  </ul>
                </Typography>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  Sau khi chuyển khoản, vui lòng chụp màn hình hoặc lưu biên lai để đối chiếu khi cần thiết.
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Danh sách lớp học chưa đóng tiền */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lớp học chưa đóng học phí
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              {unpaidClasses.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Lớp học</TableCell>
                        <TableCell align="right">Số tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unpaidClasses.map((item) => (
                        <TableRow key={item.class_id}>
                          <TableCell>{item.class_name}</TableCell>
                          <TableCell align="right">{item.amount_due.toLocaleString('vi-VN')} VNĐ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="success">
                  Bạn không có khoản học phí nào chưa thanh toán.
                </Alert>
              )}
              
              {unpaidClasses.length > 0 && (
                <Box mt={2}>
                  <Alert severity="warning">
                    Vui lòng thanh toán học phí để tiếp tục tham gia các lớp học.
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Lịch sử thanh toán */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lịch sử thanh toán
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {payments.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã biên lai</TableCell>
                  <TableCell>Lớp học</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell>Ngày thanh toán</TableCell>
                  <TableCell>Phương thức</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.receipt_number || 'N/A'}</TableCell>
                    <TableCell>{payment.classes?.name || 'N/A'}</TableCell>
                    <TableCell align="right">{payment.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                    <TableCell>{dayjs(payment.payment_date).format('DD/MM/YYYY')}</TableCell>
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
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ReceiptIcon />}
                        onClick={() => handleOpenReceiptDialog(payment)}
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
          <Alert severity="info">
            Bạn chưa có lịch sử thanh toán nào.
          </Alert>
        )}
      </Paper>
      
      {/* Dialog xem biên lai */}
      <Dialog open={receiptDialog} onClose={handleCloseReceiptDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Biên lai thanh toán</Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Chức năng tải biên lai sẽ được triển khai sau
                showNotification('Tính năng đang phát triển', 'info');
              }}
            >
              Tải biên lai
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Box>
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Mã biên lai</Typography>
                  <Typography variant="body1">{selectedPayment.receipt_number || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" align="right">Ngày thanh toán</Typography>
                  <Typography variant="body1" align="right">
                    {dayjs(selectedPayment.payment_date).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Học sinh</Typography>
                  <Typography variant="body1">
                    {student?.full_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Lớp học</Typography>
                  <Typography variant="body1">
                    {selectedPayment.classes?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phương thức thanh toán</Typography>
                  <Typography variant="body1">
                    {selectedPayment.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                  <Typography variant="body1">
                    {selectedPayment.status === 'completed' 
                      ? 'Đã thanh toán' 
                      : selectedPayment.status === 'pending' 
                        ? 'Đang xử lý' 
                        : 'Đã hủy'}
                  </Typography>
                </Grid>
              </Grid>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nội dung thanh toán</TableCell>
                      <TableCell align="right">Số tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        Thanh toán học phí lớp {selectedPayment.classes?.name || 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        {selectedPayment.amount.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                    </TableRow>
                  </TableBody>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tổng thanh toán</TableCell>
                      <TableCell align="right">
                        {selectedPayment.amount.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              </TableContainer>
              
              {selectedPayment.notes && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary">Ghi chú</Typography>
                  <Typography variant="body1">{selectedPayment.notes}</Typography>
                </Box>
              )}
              
              <Alert severity="info" icon={<InfoIcon />}>
                Biên lai này được tạo tự động từ hệ thống. Để biết thêm chi tiết, vui lòng liên hệ với quản trị viên.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReceiptDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserPayments;
