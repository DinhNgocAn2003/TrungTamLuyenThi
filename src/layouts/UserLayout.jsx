import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
  Badge,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  QrCode as QrCodeIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Download as DownloadIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import logo from '../assets/logo.png';

import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getStudentByUserId } from '../services/supabase/database';

const drawerWidth = 280;
const drawerWidthMobile = 260;

// Dynamic menu items based on role
const getMenuItems = (role) => {
  const baseItems = [
    { 
      title: 'Trang chủ', 
      path: `/${role}/dashboard`, 
      icon: <HomeIcon />, 
      color: '#4caf50',
      description: 'Dashboard và thông tin tổng quan'
    }
  ];

  if (role === 'student') {
    return [
      ...baseItems,
      { 
        title: 'Đăng ký lớp học', 
        path: '/student/classes', 
        icon: <ClassIcon />, 
        color: '#2196f3',
        description: 'Tìm kiếm và đăng ký lớp học mới'
      },
      { 
        title: 'Điểm danh', 
        path: '/student/attendance', 
        icon: <EventNoteIcon />, 
        color: '#ff9800',
        description: 'Xem lịch sử điểm danh'
      },
      { 
        title: 'Thanh toán', 
        path: '/student/payments', 
        icon: <PaymentIcon />, 
        color: '#9c27b0',
        description: 'Quản lý học phí và thanh toán'
      }
    ];
  }

  if (role === 'teacher') {
    return [
      ...baseItems,
      { 
        title: 'Lớp học của tôi', 
        path: '/teacher/classes', 
        icon: <ClassIcon />, 
        color: '#2196f3',
        description: 'Quản lý các lớp học đang dạy'
      },
      { 
        title: 'Điểm danh', 
        path: '/teacher/attendance', 
        icon: <EventNoteIcon />, 
        color: '#ff9800',
        description: 'Điểm danh học sinh'
      },
      { 
        title: 'Thanh toán', 
        path: '/teacher/payments', 
        icon: <PaymentIcon />, 
        color: '#9c27b0',
        description: 'Xem thông tin lương và thanh toán'
      }
    ];
  }

  return baseItems;
};

function UserLayout() {
  const { user, userProfile, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  
  // Check if user has student or teacher role
  useEffect(() => {
    if (userProfile && userProfile.role === 'admin') {
      console.log('❌ Access denied - admin should use admin layout');
      showNotification('Bạn không có quyền truy cập trang này', 'error');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [userProfile, navigate, showNotification]);
  
  // Get menu items based on user role
  const menuItems = getMenuItems(userProfile?.role || 'student');
  
  // Lấy thông tin học sinh khi component mount
  useEffect(() => {
    fetchStudentData();
  }, [user]);
  
  // Handle responsive drawer behavior
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true); // Luôn mở trên desktop
    }
  }, [isMobile]);
  
  const fetchStudentData = async () => {
    if (!user?.id) return;
    
    setLoadingStudent(true);
    try {
      const { data: studentData, error } = await getStudentByUserId(user.id);
      if (error) throw error;
      setStudent(studentData);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoadingStudent(false);
    }
  };
  
  const handleDrawerToggle = () => {
    // Chỉ cho phép toggle trên mobile
    if (isMobile) {
      setDrawerOpen(!drawerOpen);
    }
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await logout();
      if (error) throw error;
      
      showNotification('Đăng xuất thành công', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Lỗi khi đăng xuất: ' + error.message, 'error');
    }
  };
  
  const handleChangePassword = () => {
    navigate('/change-password');
  };
  
  const handleOpenQRDialog = () => {
    setQrDialogOpen(true);
  };
  
  const handleCloseQRDialog = () => {
    setQrDialogOpen(false);
  };
  
  const handleDownloadQR = () => {
    if (!student?.id) return;
    
    const canvas = document.querySelector("#qr-dialog canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_${student.id}_${student.full_name?.replace(/\s+/g, '_') || 'Student'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  
  const getPageTitle = () => {
    const item = menuItems.find(item => item.path === location.pathname);
    return item ? item.title : 'Học sinh';
  };

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 50%, #2e7d32 100%)',
      bgcolor: 'background.default',
      overflow: 'hidden', // Ngăn overflow
      width: '100%',
      maxWidth: '100vw' // Đảm bảo không vượt quá viewport width
    }}>
      {/* Modern AppBar with Glass Effect */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          width: { 
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)` // Luôn trừ drawer width trên desktop
          },
          ml: { 
            xs: 0,
            md: `${drawerWidth}px` // Luôn có margin left trên desktop
          },
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(30, 136, 229, 0.1)',
          boxShadow: '0 2px 12px rgba(30, 136, 229, 0.1)',
          color: 'text.primary',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          maxWidth: '100vw', // Ngăn vượt quá viewport
          overflowX: 'hidden' // Ẩn overflow ngang
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: '64px', md: '70px' }, 
          px: { xs: 1, md: 3 }, // Giảm padding trên mobile
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden'
        }}>
          {/* Chỉ hiển thị nút toggle trên mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                ml: 1,
                mr: 2,
                background: 'rgba(30, 136, 229, 0.1)',
                color: 'primary.main',
                '&:hover': {
                  background: 'rgba(30, 136, 229, 0.2)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          )}
          
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', overflow: 'hidden', minWidth: 0 }}>
            <Box 
              component="img"
              src={logo}
              alt="Logo"
              sx={{ 
                height: { xs: 28, md: 40 }, // Giảm size trên mobile
                width: 'auto',
                mr: { xs: 1, md: 2 }, // Giảm margin trên mobile
                borderRadius: 1,
                flexShrink: 0 // Không cho logo bị shrink
              }}
            />
            <Typography 
              variant="h5" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                fontSize: { xs: '1rem', md: '1.5rem' }, // Giảm font size trên mobile
                display: { xs: 'none', sm: 'block' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {getPageTitle()}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, md: 1 }, // Giảm gap trên mobile
            flexShrink: 0 // Không cho shrink
          }}>            
            <Tooltip title="Mã QR của bạn">
              <IconButton
                color="inherit"
                onClick={handleOpenQRDialog}
                sx={{ 
                  background: 'rgba(30, 136, 229, 0.1)',
                  color: 'primary.main',
                  '&:hover': { 
                    background: 'rgba(30, 136, 229, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease',
                  width: { xs: 36, md: 44 }, // Giảm size trên mobile
                  height: { xs: 36, md: 44 }
                }}
              >
                <QrCodeIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Tài khoản">
              <IconButton 
                onClick={handleOpenUserMenu} 
                sx={{ 
                  p: 0.5,
                  '&:hover': { transform: 'scale(1.05)' },
                  transition: 'all 0.3s ease'
                }}
              >
                <Avatar 
                  alt={user?.user_metadata?.full_name || 'User'}
                  sx={{
                    width: { xs: 36, md: 45 },
                    height: { xs: 36, md: 45 },
                    background: 'linear-gradient(135deg, #1e88e5 0%, #26a69a 100%)',
                    border: '2px solid rgba(30, 136, 229, 0.2)',
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  <PersonIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              sx={{ 
                mt: '50px',
                '& .MuiPaper-root': {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                  
                }
              }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {user?.user_metadata?.full_name || 'Học sinh'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem 
                onClick={handleChangePassword}
                sx={{ 
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #667eea20, #764ba220)',
                    borderRadius: '8px'
                  },
                  mx: 1,
                  borderRadius: '8px'
                }}
              >
                <ListItemIcon>
                  <SettingsIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <Typography>Đổi mật khẩu</Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #ff416c20, #ff4b2b20)',
                    borderRadius: '8px'
                  },
                  mx: 1,
                  borderRadius: '8px'
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error.main">Đăng xuất</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Modern Sidebar with Glass Effect */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"} 
        open={drawerOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: { xs: drawerWidthMobile, md: drawerWidth },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: drawerWidthMobile, md: drawerWidth },
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(30, 136, 229, 0.1)',
            boxShadow: '2px 0 12px rgba(30, 136, 229, 0.1)',
            overflow: 'hidden auto', // Chỉ scroll theo chiều dọc
            maxWidth: '100vw', // Không vượt quá viewport
            // Thin scrollbar styles
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(30, 136, 229, 0.3)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(30, 136, 229, 0.5)',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(30, 136, 229, 0.3) rgba(30, 136, 229, 0.1)',
          },
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ 
          p: { xs: 2, md: 3 }, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(30,136,229,0.1) 0%, rgba(38,166,154,0.1) 100%)',
          borderBottom: '1px solid rgba(30, 136, 229, 0.1)'
        }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgba(30, 136, 229, 0.2)',
            }}
          >
            <Box 
              component="img"
              src={logo}
              alt="Logo"
              sx={{ 
                height: { xs: 36, md: 40 },
                width: 'auto',
                mb: 1,
                borderRadius: 1
              }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 700,
                fontSize: { xs: '0.95rem', md: '1.1rem' }
              }}
            >
              TRUNG TÂM DNA
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                mt: 0.5,
                fontSize: { xs: '0.75rem', md: '0.875rem' }
              }}
            >
              Nơi ươm mầm tương lai ✨
            </Typography>
          </Paper>
        </Box>
        
        {/* User Info Card */}
        <Box sx={{ p: { xs: 1.5, md: 2 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgba(30, 136, 229, 0.2)',
              textAlign: 'center'
            }}
          >
            <Avatar
              sx={{
                width: { xs: 50, md: 60 },
                height: { xs: 50, md: 60 },
                mx: 'auto',
                mb: 1,
                background: 'linear-gradient(135deg, #1e88e5 0%, #26a69a 100%)',
                border: '2px solid rgba(30, 136, 229, 0.3)',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              <PersonIcon sx={{ fontSize: { xs: 28, md: 36 } }} />
            </Avatar>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'text.primary', 
                fontWeight: 600,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              {user?.user_metadata?.full_name || 'Học sinh'}
            </Typography>
            <Chip
              label="Học sinh"
              size="small"
              sx={{
                mt: 1,
                background: 'linear-gradient(45deg, #26a69a, #1e88e5)',
                color: '#fff',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', md: '0.75rem' }
              }}
            />
          </Paper>
        </Box>
        
        {/* Navigation Menu */}
        <Box sx={{ flex: 1, px: { xs: 0.5, md: 1 } }}>
          <List sx={{ pt: 1 }}>
            {menuItems.map((item, index) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) {
                      setDrawerOpen(false);
                    }
                  }}
                  sx={{
                    mx: { xs: 0.5, md: 1 },
                    borderRadius: '15px',
                    minHeight: { xs: 52, md: 60 },
                    background: location.pathname === item.path 
                      ? 'rgba(30, 136, 229, 0.15)' 
                      : 'transparent',
                    backdropFilter: location.pathname === item.path ? 'blur(10px)' : 'none',
                    border: location.pathname === item.path 
                      ? '1px solid rgba(30, 136, 229, 0.2)' 
                      : '1px solid transparent',
                    '&:hover': {
                      background: 'rgba(30, 136, 229, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(30, 136, 229, 0.2)',
                      transform: 'translateX(5px)',
                    },
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background: 'rgba(30, 136, 229, 0.15)',
                      '&:hover': {
                        background: 'rgba(30, 136, 229, 0.2)',
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                      minWidth: { xs: 40, md: 45 }
                    }}
                  >
                    <Box
                      sx={{
                        p: { xs: 0.75, md: 1 },
                        borderRadius: '10px',
                        background: location.pathname === item.path 
                          ? `linear-gradient(135deg, ${item.color}40, ${item.color}60)`
                          : 'rgba(30, 136, 229, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography
                        sx={{
                          color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                          fontWeight: location.pathname === item.path ? 600 : 500,
                          fontSize: { xs: '0.85rem', md: '0.9rem' }
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.7rem', md: '0.75rem' },
                          mt: 0.5,
                          display: { xs: 'none', md: 'block' }
                        }}
                      >
                        {item.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* Bottom Info */}
        <Box sx={{ p: { xs: 1.5, md: 2 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1, md: 1.5 },
              background: 'rgba(30, 136, 229, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(30, 136, 229, 0.1)',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                display: 'block',
                fontSize: { xs: '0.7rem', md: '0.75rem' }
              }}
            >
              Phiên bản 1.0.0
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.disabled',
                display: 'block',
                fontSize: { xs: '0.65rem', md: '0.7rem' }
              }}
            >
              © 2025 Education System
            </Typography>
          </Paper>
        </Box>
      </Drawer>
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)` // Luôn trừ drawer width trên desktop
          },
          ml: { 
            xs: 0,
            md: 0 // Không cần margin left trên desktop vì drawer là permanent
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: '100vh',
          background: 'transparent',
          maxWidth: '100vw', // Không vượt quá viewport
          overflow: 'hidden auto', // Chỉ scroll theo chiều dọc
          position: 'relative'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '64px', md: '70px' } }} />
        <Container 
          maxWidth="xl" 
          sx={{ 
            mt: { xs: 2, md: 3 },
            pb: { xs: 3, md: 4 },
            px: { xs: 1, md: 3 }, // Giảm padding trên mobile
            position: 'relative',
            width: '100%',
            maxWidth: '100%', // Đảm bảo container không vượt quá parent
            overflow: 'hidden'
          }}
        >
          <Outlet />
        </Container>
      </Box>
      
      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={handleCloseQRDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          background: 'linear-gradient(135deg, #1e88e5 0%, #26a69a 100%)',
          color: 'white',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
            <QrCodeIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              Mã QR Học Sinh
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent id="qr-dialog" sx={{ textAlign: 'center', py: 4 }}>
          {loadingStudent ? (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <CircularProgress size={60} />
              <Typography variant="body1" color="text.secondary">
                Đang tải thông tin học sinh...
              </Typography>
            </Box>
          ) : student?.id ? (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  background: 'white',
                  borderRadius: '15px',
                  border: '2px solid #1e88e5',
                  display: 'inline-block'
                }}
              >
                <QRCode 
                  value={student.id} 
                  size={200}
                  level="H"
                  includeMargin
                  style={{
                    background: 'white',
                    borderRadius: '10px'
                  }}
                />
              </Paper>
              
              <Box textAlign="center" mt={2}>
                <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                  {student.full_name}
                </Typography>
                <Chip
                  label={`Mã học sinh: ${student.id}`}
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    px: 2,
                    py: 0.5
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  💡 Sử dụng mã QR này để điểm danh trong lớp học
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <QrCodeIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
              <Typography variant="h6" color="error.main" fontWeight="bold">
                Không tìm thấy thông tin học sinh
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Vui lòng liên hệ với quản trị viên để cập nhật thông tin học sinh
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
          {student?.id && !loadingStudent && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadQR}
              sx={{
                background: 'linear-gradient(135deg, #26a69a 0%, #1e88e5 100%)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '25px',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e88e5 0%, #26a69a 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(30, 136, 229, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Tải xuống mã QR
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={handleCloseQRDialog}
            sx={{
              borderRadius: '25px',
              px: 3,
              fontWeight: 'bold',
              borderColor: '#1e88e5',
              color: '#1e88e5',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(30, 136, 229, 0.1)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserLayout;
