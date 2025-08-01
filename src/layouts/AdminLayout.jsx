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
  Paper,
  Chip,
  alpha
} from '@mui/material';
import logo from '../assets/logo.png';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SupervisorIcon
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const drawerWidth = 300;

const menuItems = [
  { 
    title: 'Tổng quan', 
    path: '/admin/dashboard', 
    icon: <DashboardIcon />, 
    color: '#4caf50',
    description: 'Dashboard quản trị tổng quan'
  },
  { 
    title: 'Quản lý lớp học', 
    path: '/admin/classes', 
    icon: <ClassIcon />, 
    color: '#2196f3',
    description: 'Tạo và quản lý các lớp học'
  },
  { 
    title: 'Quản lý học sinh', 
    path: '/admin/students', 
    icon: <PersonIcon />, 
    color: '#ff9800',
    description: 'Thông tin và quản lý học sinh'
  },
  { 
    title: 'Quản lý giáo viên', 
    path: '/admin/teachers', 
    icon: <SupervisorIcon />, 
    color: '#e91e63',
    description: 'Thông tin và quản lý giáo viên'
  },
  { 
    title: 'Quản lý người dùng', 
    path: '/admin/users', 
    icon: <AdminIcon />, 
    color: '#9c27b0',
    description: 'Quản lý tài khoản admin và hệ thống'
  },
  { 
    title: 'Điểm danh', 
    path: '/admin/attendance', 
    icon: <EventNoteIcon />, 
    color: '#00bcd4',
    description: 'Theo dõi và quản lý điểm danh'
  },
  { 
    title: 'Thanh toán học phí', 
    path: '/admin/payments', 
    icon: <PaymentIcon />, 
    color: '#8bc34a',
    description: 'Quản lý thu chi và học phí'
  },
  { 
    title: 'Báo cáo & Thống kê', 
    path: '/admin/reports', 
    icon: <AssessmentIcon />, 
    color: '#f44336',
    description: 'Báo cáo chi tiết và phân tích'
  },
];

function AdminLayout() {
  const { user, userProfile, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorElUser, setAnchorElUser] = useState(null);
  
  // Check if user has admin role
  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin') {
      console.log('❌ Access denied - not admin role:', userProfile.role);
      showNotification('Bạn không có quyền truy cập trang này', 'error');
      navigate('/login', { replace: true });
    }
  }, [userProfile, navigate, showNotification]);
  
  // Handle responsive drawer behavior
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true); // Luôn mở trên desktop
    }
  }, [isMobile]);
  
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
  
  const getPageTitle = () => {
    const item = menuItems.find(item => item.path === location.pathname);
    return item ? item.title : 'Quản trị viên';
  };

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6a4c93 100%)', // Gradient tím giáo dục chuyên nghiệp
      overflow: 'hidden', // Ngăn overflow
      width: '100%',
      maxWidth: '100vw' // Đảm bảo không vượt quá viewport width
    }}>
      {/* Modern Admin AppBar */}
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
          background: 'rgba(255, 255, 255, 0.15)', // Tăng độ trong suốt
          backdropFilter: 'blur(25px)', // Tăng hiệu ứng blur
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)', // Border sáng hơn
          boxShadow: '0 8px 32px rgba(103, 126, 234, 0.25)', // Shadow màu tím nhẹ
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          maxWidth: '100vw', // Ngăn vượt quá viewport
          overflowX: 'hidden' // Ẩn overflow ngang
        }}
      >
        <Toolbar sx={{ 
          minHeight: '75px !important',
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
                mr: 2,
                ml:1,
                background: 'rgba(255, 255, 255, 0.15)', // Tăng độ trong suốt cho nút
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)', // Hover sáng hơn
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
            {/* <AdminIcon sx={{ mr: 1.5, fontSize: { xs: 24, md: 32 }, color: '#fff', flexShrink: 0 }} /> */}
            <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
              <Typography 
                variant="h5" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #fff, #e8eaf6)', // Gradient trắng nhẹ
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontSize: { xs: '1rem', md: '1.5rem' },
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {getPageTitle()}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Quản trị hệ thống
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, md: 1 }, // Giảm gap trên mobile
            flexShrink: 0 // Không cho shrink
          }}>
            <Tooltip title="Tài khoản quản trị">
              <IconButton 
                onClick={handleOpenUserMenu} 
                sx={{ 
                  p: 0.5,
                  '&:hover': { transform: 'scale(1.05)' },
                  transition: 'all 0.3s ease'
                }}
              >
                <Avatar 
                  alt={user?.user_metadata?.full_name || 'Admin'}
                  sx={{
                    width: 50,
                    height: 50,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Gradient tím match với background
                    border: '3px solid rgba(255, 255, 255, 0.4)', // Border sáng hơn
                    fontSize: '1.3rem',
                    fontWeight: 'bold'
                  }}
                >
                  <PersonIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              sx={{ 
                mt: '55px',
                '& .MuiPaper-root': {
                  background: 'rgba(255, 255, 255, 0.98)', // Gần như trắng hoàn toàn
                  backdropFilter: 'blur(25px)', // Tăng blur
                  borderRadius: '20px', // Bo góc nhiều hơn
                  border: '1px solid rgba(103, 126, 234, 0.2)', // Border tím nhẹ
                  boxShadow: '0 12px 40px rgba(103, 126, 234, 0.15)', // Shadow tím
                  minWidth: 240 // Tăng width
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
                    {user?.user_metadata?.full_name || 'Quản trị viên'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label="Administrator"
                    size="small"
                    sx={{
                      mt: 1,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)', // Gradient tím
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem 
                onClick={handleChangePassword}
                sx={{ 
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #667eea15, #764ba215)', // Hover tím nhẹ
                    borderRadius: '10px'
                  },
                  mx: 1,
                  borderRadius: '10px'
                }}
              >
                <ListItemIcon>
                  <SettingsIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <Typography>Cài đặt hệ thống</Typography>
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
      
      {/* Modern Admin Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"} 
        open={drawerOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.08)', // Tăng độ trong suốt
            backdropFilter: 'blur(25px)', // Tăng blur
            borderRight: '1px solid rgba(255, 255, 255, 0.15)', // Border sáng hơn
            boxShadow: '0 12px 40px rgba(103, 126, 234, 0.2)', // Shadow tím
            overflow: 'hidden auto', // Chỉ scroll theo chiều dọc
            maxWidth: '100vw', // Không vượt quá viewport
            // Custom thin scrollbar
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
              },
            },
          },
        }}
      >
        {/* Admin Header */}
        <Box sx={{ 
          p: 3, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)', // Tăng độ sáng
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)' // Border sáng hơn
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.15)', // Tăng độ trong suốt
              backdropFilter: 'blur(15px)', // Tăng blur
              borderRadius: '18px', // Bo góc nhiều hơn
              border: '1px solid rgba(255, 255, 255, 0.25)', // Border sáng hơn
            }}
          >
            <SupervisorIcon sx={{ fontSize: 45, color: '#e8eaf6', mb: 1 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}
            >
              ADMIN PANEL
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                mt: 0.5
              }}
            >
              Trung tâm DNA 🎓
            </Typography>
          </Paper>
        </Box>
        
        {/* Admin Info Card */}
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.15)', // Tăng độ trong suốt
              backdropFilter: 'blur(15px)', // Tăng blur
              borderRadius: '18px', // Bo góc nhiều hơn
              border: '1px solid rgba(255, 255, 255, 0.25)', // Border sáng hơn
              textAlign: 'center'
            }}
          >
            <Avatar
              sx={{
                width: 65,
                height: 65,
                mx: 'auto',
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Gradient tím match với background
                border: '3px solid rgba(255, 255, 255, 0.4)', // Border sáng hơn
                fontSize: '1.6rem',
                fontWeight: 'bold'
              }}
            >
              <PersonIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#fff', 
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              {user?.user_metadata?.full_name || 'Quản trị viên'}
            </Typography>
            <Chip
              label="Administrator"
              size="small"
              sx={{
                mt: 1,
                background: 'linear-gradient(45deg, #667eea, #764ba2)', // Gradient tím
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          </Paper>
        </Box>
        
        {/* Navigation Menu */}
        <Box sx={{ flex: 1, px: 1 }}>
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
                    mx: 1,
                    borderRadius: '15px',
                    minHeight: 65,
                    background: location.pathname === item.path 
                      ? 'rgba(255, 255, 255, 0.2)' // Tăng độ sáng khi selected
                      : 'transparent',
                    backdropFilter: location.pathname === item.path ? 'blur(15px)' : 'none', // Tăng blur
                    border: location.pathname === item.path 
                      ? '1px solid rgba(255, 255, 255, 0.3)' // Border sáng hơn
                      : '1px solid transparent',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.15)', // Hover sáng hơn
                      backdropFilter: 'blur(15px)', // Tăng blur
                      border: '1px solid rgba(255, 255, 255, 0.25)', // Border sáng hơn
                      transform: 'translateX(5px)',
                    },
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background: 'rgba(255, 255, 255, 0.2)', // Tăng độ sáng
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.25)', // Hover selected sáng hơn
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                      minWidth: 50
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: '12px',
                        background: location.pathname === item.path 
                          ? `linear-gradient(135deg, ${item.color}50, ${item.color}70)` // Tăng độ đậm gradient
                          : 'rgba(255, 255, 255, 0.15)', // Tăng độ trong suốt background
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
                          color: location.pathname === item.path ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                          fontWeight: location.pathname === item.path ? 600 : 500,
                          fontSize: '0.95rem'
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.75rem',
                          mt: 0.5
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
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              background: 'rgba(255, 255, 255, 0.08)', // Tăng độ trong suốt
              borderRadius: '12px', // Bo góc nhiều hơn
              border: '1px solid rgba(255, 255, 255, 0.15)', // Border sáng hơn
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'block'
              }}
            >
              Admin Panel v1.0.0
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.5)',
                display: 'block'
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
        <Toolbar sx={{ minHeight: '75px !important' }} />
        <Container 
          maxWidth="xl" 
          sx={{ 
            mt: 3,
            pb: 4,
            px: { xs: 1, md: 3 }, // Giảm padding trên mobile
            position: 'relative',
            width: '100%',
            maxWidth: '100%', // Đảm bảo container không vượt quá parent
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: -20,
              right: -20,
              bottom: -20,
              background: 'rgba(255, 255, 255, 0.08)', // Tăng độ trong suốt
              backdropFilter: 'blur(15px)', // Tăng blur
              borderRadius: '25px', // Bo góc nhiều hơn
              border: '1px solid rgba(255, 255, 255, 0.15)', // Border sáng hơn
              zIndex: -1
            }
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default AdminLayout;
