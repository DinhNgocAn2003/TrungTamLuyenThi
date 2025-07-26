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
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import logo from '../assets/logo.png';

import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const drawerWidth = 280;
const drawerWidthMobile = 260;

const menuItems = [
  { 
    title: 'Trang chủ', 
    path: '/user/teacher/dashboard', 
    icon: <HomeIcon />, 
    color: '#4caf50',
    description: 'Dashboard và thông tin tổng quan'
  },
  { 
    title: 'Lớp học của tôi', 
    path: '/user/teacher/classes', 
    icon: <ClassIcon />, 
    color: '#2196f3',
    description: 'Quản lý các lớp học đang giảng dạy'
  },
  { 
    title: 'Điểm danh', 
    path: '/user/teacher/attendance', 
    icon: <EventNoteIcon />, 
    color: '#ff9800',
    description: 'Điểm danh học sinh trong lớp'
  },
  { 
    title: 'Quản lý bài kiểm tra', 
    path: '/user/teacher/tests', 
    icon: <AssignmentIcon />, 
    color: '#9c27b0',
    description: 'Tạo và thông báo lịch kiểm tra'
  },
  { 
    title: 'Nhập điểm', 
    path: '/user/teacher/grades', 
    icon: <GradeIcon />, 
    color: '#f44336',
    description: 'Nhập điểm kiểm tra và tính hệ số'
  },
];

function TeacherLayout() {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorElUser, setAnchorElUser] = useState(null);
  
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
    return item ? item.title : 'Giáo viên';
  };

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e88e5 0%, #1976d2 50%, #1565c0 100%)',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>
      {/* Modern Teacher AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          width: { 
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)`
          },
          ml: { 
            xs: 0,
            md: `${drawerWidth}px`
          },
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          color: 'white',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          maxWidth: '100vw',
          overflowX: 'hidden'
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: '64px', md: '70px' }, 
          px: { xs: 1, md: 3 },
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
                background: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
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
                height: { xs: 28, md: 40 },
                width: 'auto',
                mr: { xs: 1, md: 2 },
                borderRadius: 1,
                flexShrink: 0
              }}
            />
            <SchoolIcon sx={{ mr: 1.5, fontSize: { xs: 24, md: 32 }, color: '#fff', flexShrink: 0 }} />
            <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
              <Typography 
                variant="h5" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #fff, #f0f0f0)',
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
                Khu vực giáo viên
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, md: 1 },
            flexShrink: 0
          }}>
            <Tooltip title="Thông báo">
              <IconButton
                color="inherit"
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease',
                  width: { xs: 36, md: 44 },
                  height: { xs: 36, md: 44 }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
                </Badge>
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
                  alt={user?.user_metadata?.full_name || 'Teacher'}
                  sx={{
                    width: { xs: 36, md: 45 },
                    height: { xs: 36, md: 45 },
                    background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
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
                  minWidth: 220
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
                    {user?.user_metadata?.full_name || 'Giáo viên'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label="Teacher"
                    size="small"
                    sx={{
                      mt: 1,
                      background: 'linear-gradient(45deg, #4fc3f7, #29b6f6)',
                      color: '#fff',
                      fontWeight: 600
                    }}
                  />
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
      
      {/* Modern Teacher Sidebar */}
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
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            overflow: 'hidden auto',
            maxWidth: '100vw',
            // Thin scrollbar styles
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.5)',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ 
          p: { xs: 2, md: 3 }, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
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
                color: '#fff',
                fontWeight: 700,
                fontSize: { xs: '0.95rem', md: '1.1rem' }
              }}
            >
              GIÁO VIÊN
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                mt: 0.5,
                fontSize: { xs: '0.75rem', md: '0.875rem' }
              }}
            >
              Khu vực quản lý lớp học 📚
            </Typography>
          </Paper>
        </Box>
        
        {/* Teacher Info Card */}
        <Box sx={{ p: { xs: 1.5, md: 2 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}
          >
            <Avatar
              sx={{
                width: { xs: 50, md: 60 },
                height: { xs: 50, md: 60 },
                mx: 'auto',
                mb: 1,
                background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
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
                color: '#fff', 
                fontWeight: 600,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              {user?.user_metadata?.full_name || 'Giáo viên'}
            </Typography>
            <Chip
              label="Teacher"
              size="small"
              sx={{
                mt: 1,
                background: 'linear-gradient(45deg, #4fc3f7, #29b6f6)',
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
                      ? 'rgba(255, 255, 255, 0.15)' 
                      : 'transparent',
                    backdropFilter: location.pathname === item.path ? 'blur(10px)' : 'none',
                    border: location.pathname === item.path 
                      ? '1px solid rgba(255, 255, 255, 0.2)' 
                      : '1px solid transparent',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transform: 'translateX(5px)',
                    },
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.2)',
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                      minWidth: { xs: 40, md: 45 }
                    }}
                  >
                    <Box
                      sx={{
                        p: { xs: 0.75, md: 1 },
                        borderRadius: '10px',
                        background: location.pathname === item.path 
                          ? `linear-gradient(135deg, ${item.color}40, ${item.color}60)`
                          : 'rgba(255, 255, 255, 0.1)',
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
                          fontSize: { xs: '0.85rem', md: '0.9rem' }
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
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
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'block',
                fontSize: { xs: '0.7rem', md: '0.75rem' }
              }}
            >
              Teacher Panel v1.0.0
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.5)',
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
            md: `calc(100% - ${drawerWidth}px)`
          },
          ml: { 
            xs: 0,
            md: 0
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: '100vh',
          background: 'transparent',
          maxWidth: '100vw',
          overflow: 'hidden auto',
          position: 'relative'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '64px', md: '70px' } }} />
        <Container 
          maxWidth="xl" 
          sx={{ 
            mt: { xs: 2, md: 3 },
            pb: { xs: 3, md: 4 },
            px: { xs: 1, md: 3 },
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: -20,
              right: -20,
              bottom: -20,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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

export default TeacherLayout;
