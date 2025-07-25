import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaymentsIcon from '@mui/icons-material/Payments';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PrintIcon from '@mui/icons-material/Print';
import dayjs from 'dayjs';

import { 
  getClasses, 
  getStudents, 
  getPayments,
  createPayment, 
  updatePayment,
  getUnpaidStudents,
  sendZaloNotification,
  
} from '../../services/supabase/database';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';

function Payments() {
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [tabValue, setTabValue] = useState(0);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  
  const [formData, setFormData] = useState({
    student_id: '',
    class_id: '',
    amount: 0,
    payment_date: dayjs(),
    payment_method: 'cash',
    status: 'completed',
    transaction_id: '',
    receipt_number: '',
    notes: ''
  });
  
  const [filters, setFilters] = useState({
    class_id: '',
    student_id: '',
    payment_method: '',
    status: '',
    date_from: null,
    date_to: null
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Khi chuyển tab, reset form và load dữ liệu phù hợp
    if (tabValue === 0) {
      fetchPayments();
    } else if (tabValue === 1) {
      fetchUnpaidStudents();
    }
  }, [tabValue]);

  useEffect(() => {
    // Áp dụng bộ lọc
    applyFilters();
  }, [searchTerm, filters, payments]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClasses(),
        fetchStudents(),
        fetchPayments()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showNotification('Lỗi khi tải dữ liệu ban đầu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await getClasses();
      if (error) throw error;

      setClasses(data || []);
      setClassOptions((data || []).map(c => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error('Error fetching classes:', error);
      showNotification('Lỗi khi tải danh sách lớp học', 'error');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await getStudents();
      if (error) throw error;

      setStudents(data || []);
      setStudentOptions((data || []).map(s => ({ id: s.id, name: s.full_name })));
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification('Lỗi khi tải danh sách học sinh', 'error');
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await getPayments();
      if (error) throw error;

      setPayments(data || []);
      setFilteredPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showNotification('Lỗi khi tải lịch sử thanh toán', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await getUnpaidStudents();
      if (error) throw error;

      // Ensure class_id exists in the data
      const processedData = (data || []).map(student => ({
        ...student,
        class_id: student.class_id || null, // Fallback if class_id is missing
      }));

      setUnpaidStudents(processedData);
    } catch (error) {
      console.error('Error fetching unpaid students:', error);
      showNotification('Lỗi khi tải danh sách học sinh chưa đóng tiền', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];
    
    // Tìm kiếm theo từ khóa
    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const studentName = payment.students?.full_name.toLowerCase() || '';
        const className = payment.classes?.name.toLowerCase() || '';
        const transactionId = payment.transaction_id?.toLowerCase() || '';
        const receiptNumber = payment.receipt_number?.toLowerCase() || '';
        
        return studentName.includes(searchTerm.toLowerCase()) ||
               className.includes(searchTerm.toLowerCase()) ||
               transactionId.includes(searchTerm.toLowerCase()) ||
               receiptNumber.includes(searchTerm.toLowerCase());
      });
    }
    
    // Lọc theo lớp học
    if (filters.class_id) {
      filtered = filtered.filter(payment => payment.class_id === filters.class_id);
    }
    
    // Lọc theo học sinh
    if (filters.student_id) {
      filtered = filtered.filter(payment => payment.student_id === filters.student_id);
    }
    
    // Lọc theo phương thức thanh toán
    if (filters.payment_method) {
      filtered = filtered.filter(payment => payment.payment_method === filters.payment_method);
    }
    
    // Lọc theo trạng thái
    if (filters.status) {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }
    
    // Lọc theo khoảng thời gian
    if (filters.date_from) {
      const fromDate = dayjs(filters.date_from).startOf('day');
      filtered = filtered.filter(payment => 
        dayjs(payment.payment_date).isAfter(fromDate) || 
        dayjs(payment.payment_date).isSame(fromDate)
      );
    }
    
    if (filters.date_to) {
      const toDate = dayjs(filters.date_to).endOf('day');
      filtered = filtered.filter(payment => 
        dayjs(payment.payment_date).isBefore(toDate) || 
        dayjs(payment.payment_date).isSame(toDate)
      );
    }
    
    setFilteredPayments(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (payment = null) => {
    if (payment) {
      setFormData({
        ...payment,
        payment_date: dayjs(payment.payment_date)
      });
      setSelectedPayment(payment);
    } else {
      setFormData({
        student_id: '',
        class_id: '',
        amount: 0,
        payment_date: dayjs(),
        payment_method: 'cash',
        status: 'completed',
        transaction_id: '',
        receipt_number: generateReceiptNumber(),
        notes: ''
      });
      setSelectedPayment(null);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenReceiptDialog = (payment) => {
    setSelectedPayment(payment);
    setOpenReceiptDialog(true);
  };

  const handleCloseReceiptDialog = () => {
    setOpenReceiptDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterDateChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentForUnpaid = (student) => {
    setFormData({
      student_id: student.id,
      class_id: student.class_id,
      amount: student.amount_due,
      payment_date: dayjs(),
      payment_method: 'cash',
      status: 'completed',
      transaction_id: '',
      receipt_number: generateReceiptNumber(),
      notes: `Thanh toán học phí lớp ${student.class_name}`
    });
    
    setOpenDialog(true);
  };

  const generateReceiptNumber = () => {
    const prefix = 'RECEIPT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.student_id || !formData.class_id) {
      showNotification('Vui lòng chọn học sinh và lớp học', 'error');
      return;
    }
    
    if (!formData.amount || formData.amount <= 0) {
      showNotification('Vui lòng nhập số tiền hợp lệ', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const paymentData = {
        ...formData,
        payment_date: formData.payment_date.format('YYYY-MM-DD'),
        amount: Number(formData.amount)
      };
      
      let result;
      
      if (selectedPayment) {
        // Cập nhật thanh toán
        result = await updatePayment(selectedPayment.id, paymentData);
      } else {
        // Tạo thanh toán mới
        result = await createPayment(paymentData);
      }
      
      if (result.error) throw result.error;
      
      showNotification(
        selectedPayment ? 'Cập nhật thanh toán thành công' : 'Tạo thanh toán mới thành công',
        'success'
      );
      
      handleCloseDialog();
      fetchPayments();
      fetchUnpaidStudents();
      
    } catch (error) {
      console.error('Error saving payment:', error);
      showNotification('Lỗi khi lưu thanh toán: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      class_id: '',
      student_id: '',
      payment_method: '',
      status: '',
      date_from: null,
      date_to: null
    });
    setSearchTerm('');
  };

  const handleSendReminder = async (student) => {
    setLoading(true);
    try {
      const message = `Thông báo: Học sinh ${student.full_name} cần đóng học phí cho lớp ${student.class_name}. Số tiền: ${student.amount_due.toLocaleString('vi-VN')} VNĐ.`;
      
      const { data, error } = await sendZaloNotification(
        student.id,
        'payment',
        message
      );
      
      if (error) throw error;
      
      showNotification('Đã gửi thông báo nhắc nhở thành công', 'success');
    } catch (error) {
      console.error('Error sending reminder:', error);
      showNotification('Lỗi khi gửi thông báo: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    // Tạo trang in
    const printWindow = window.open('', '_blank');
    
    const student = students.find(s => s.id === selectedPayment.student_id);
    const classObj = classes.find(c => c.id === selectedPayment.class_id);
    
    // Tạo nội dung biên lai
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Biên lai thanh toán</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 16px;
            color: #555;
          }
          .info {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            width: 150px;
          }
          .info-value {
            flex: 1;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .table th, .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .table th {
            background-color: #f2f2f2;
          }
          .footer {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            margin-top: 50px;
            border-top: 1px solid #333;
          }
          @media print {
            body {
              padding: 0;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="title">BIÊN LAI THANH TOÁN</div>
            <div class="subtitle">Trung tâm dạy thêm ABC</div>
          </div>
          
          <div class="info">
            <div class="info-row">
              <div class="info-label">Mã biên lai:</div>
              <div class="info-value">${selectedPayment.receipt_number}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Ngày thanh toán:</div>
              <div class="info-value">${dayjs(selectedPayment.payment_date).format('DD/MM/YYYY')}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Học sinh:</div>
              <div class="info-value">${student?.full_name || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Lớp học:</div>
              <div class="info-value">${classObj?.name || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Phương thức:</div>
              <div class="info-value">${selectedPayment.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</div>
            </div>
            ${selectedPayment.transaction_id ? `
            <div class="info-row">
              <div class="info-label">Mã giao dịch:</div>
              <div class="info-value">${selectedPayment.transaction_id}</div>
            </div>
            ` : ''}
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th style="width: 70%">Nội dung thanh toán</th>
                <th style="width: 30%">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Học phí lớp ${classObj?.name || 'N/A'}</td>
                <td>${selectedPayment.amount.toLocaleString('vi-VN')} VNĐ</td>
              </tr>
              ${selectedPayment.notes ? `
              <tr>
                <td colspan="2">Ghi chú: ${selectedPayment.notes}</td>
              </tr>
              ` : ''}
            </tbody>
            <tfoot>
              <tr>
                <th>Tổng thanh toán</th>
                <th>${selectedPayment.amount.toLocaleString('vi-VN')} VNĐ</th>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <div class="signature">
              <div>Người nộp tiền</div>
              <div class="signature-line"></div>
            </div>
            
            <div class="signature">
              <div>Người thu tiền</div>
              <div class="signature-line"></div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">In biên lai</button>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    
    // Tự động in sau khi tải xong
    printWindow.onload = function() {
      printWindow.focus();
      // printWindow.print();
    };
  };

  return (
    <Box>
      <PageHeader 
        title="Thanh toán học phí" 
        breadcrumbs={[
          { label: 'Trang chủ', link: '/admin' },
          { label: 'Thanh toán học phí' }
        ]} 
      />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<PaymentsIcon />} label="Lịch sử thanh toán" />
          <Tab icon={<MoneyOffIcon />} label="Danh sách nợ học phí" />
        </Tabs>
      </Box>
      
      {/* Tab lịch sử thanh toán */}
      {tabValue === 0 && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
              <TextField
                placeholder="Tìm kiếm thanh toán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1, maxWidth: '300px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Thêm thanh toán
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Bộ lọc</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Lớp học</InputLabel>
                    <Select
                      name="class_id"
                      value={filters.class_id}
                      onChange={handleFilterChange}
                      label="Lớp học"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {classOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Học sinh</InputLabel>
                    <Select
                      name="student_id"
                      value={filters.student_id}
                      onChange={handleFilterChange}
                      label="Học sinh"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {studentOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Phương thức</InputLabel>
                    <Select
                      name="payment_method"
                      value={filters.payment_method}
                      onChange={handleFilterChange}
                      label="Phương thức"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="cash">Tiền mặt</MenuItem>
                      <MenuItem value="transfer">Chuyển khoản</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      label="Trạng thái"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="completed">Đã thanh toán</MenuItem>
                      <MenuItem value="pending">Đang xử lý</MenuItem>
                      <MenuItem value="cancelled">Đã hủy</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Từ ngày"
                    value={filters.date_from}
                    onChange={(value) => handleFilterDateChange('date_from', value)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Đến ngày"
                    value={filters.date_to}
                    onChange={(value) => handleFilterDateChange('date_to', value)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                  <Button 
                    variant="outlined"
                    onClick={handleResetFilters}
                    fullWidth
                  >
                    Xóa bộ lọc
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã biên lai</TableCell>
                    <TableCell>Học sinh</TableCell>
                    <TableCell>Lớp học</TableCell>
                    <TableCell align="right">Số tiền</TableCell>
                    <TableCell>Ngày thanh toán</TableCell>
                    <TableCell>Phương thức</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.receipt_number || 'N/A'}</TableCell>
                        <TableCell>{payment.students?.full_name || 'N/A'}</TableCell>
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
                        <TableCell>
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
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => handleOpenReceiptDialog(payment)}
                            title="Xem biên lai"
                          >
                            <ReceiptIcon />
                          </IconButton>
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleOpenDialog(payment)}
                            title="Sửa thanh toán"
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary" py={2}>
                          Không có dữ liệu thanh toán nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
      
      {/* Tab danh sách nợ học phí */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Danh sách học sinh chưa đóng học phí ({unpaidStudents.length})
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {unpaidStudents.length > 0 ? (
            <TableContainer>
              <Table>
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
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            {student.full_name.charAt(0)}
                          </Avatar>
                          {student.full_name}
                        </Box>
                      </TableCell>
                      <TableCell>{student.class_name}</TableCell>
                      <TableCell align="right">{student.amount_due.toLocaleString('vi-VN')} VNĐ</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<PaymentsIcon />}
                          onClick={() => handlePaymentForUnpaid(student)}
                          sx={{ mr: 1 }}
                        >
                          Thanh toán
                        </Button>
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          startIcon={<NotificationsIcon />}
                          onClick={() => handleSendReminder(student)}
                        >
                          Nhắc nhở
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="success">
              Tất cả học sinh đã đóng học phí đầy đủ!
            </Alert>
          )}
        </Paper>
      )}
      
      {/* Dialog thêm/sửa thanh toán */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPayment ? 'Cập nhật thanh toán' : 'Thêm thanh toán mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Học sinh</InputLabel>
                <Select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  label="Học sinh"
                  disabled={!!selectedPayment}
                >
                  <MenuItem value="">-- Chọn học sinh --</MenuItem>
                  {studentOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Lớp học</InputLabel>
                <Select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleInputChange}
                  label="Lớp học"
                  disabled={!!selectedPayment}
                >
                  <MenuItem value="">-- Chọn lớp học --</MenuItem>
                  {classOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="amount"
                label="Số tiền (VNĐ)"
                fullWidth
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Ngày thanh toán"
                value={formData.payment_date}
                onChange={(value) => handleDateChange('payment_date', value)}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  label="Phương thức thanh toán"
                >
                  <MenuItem value="cash">Tiền mặt</MenuItem>
                  <MenuItem value="transfer">Chuyển khoản</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Trạng thái"
                >
                  <MenuItem value="completed">Đã thanh toán</MenuItem>
                  <MenuItem value="pending">Đang xử lý</MenuItem>
                  <MenuItem value="cancelled">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="receipt_number"
                label="Mã biên lai"
                fullWidth
                value={formData.receipt_number}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="transaction_id"
                label="Mã giao dịch (cho chuyển khoản)"
                fullWidth
                value={formData.transaction_id}
                onChange={handleInputChange}
                margin="normal"
                disabled={formData.payment_method !== 'transfer'}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Ghi chú"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedPayment ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xem biên lai */}
      <Dialog open={openReceiptDialog} onClose={handleCloseReceiptDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Biên lai thanh toán</Typography>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintReceipt}
            >
              In biên lai
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
                    {students.find(s => s.id === selectedPayment.student_id)?.full_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Lớp học</Typography>
                  <Typography variant="body1">
                    {classes.find(c => c.id === selectedPayment.class_id)?.name || 'N/A'}
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
                        Thanh toán học phí lớp {classes.find(c => c.id === selectedPayment.class_id)?.name || 'N/A'}
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

export default Payments;
