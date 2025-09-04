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
  { title: 'Trang chủ', path: '/teacher/dashboard', icon: <HomeIcon />, color: '#4caf50', description: 'Tổng quan' },
  { title: 'Lớp học', path: '/teacher/classes', icon: <ClassIcon />, color: '#2196f3', description: 'Xem lớp dạy' },
  { title: 'Điểm danh', path: '/teacher/attendance', icon: <EventNoteIcon />, color: '#ff9800', description: 'Điểm danh học sinh' },
];

function TeacherLayout() {
  const { user, userProfile, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  // Treat tablets as mobile interactions (temporary drawer) up to lg breakpoint
  const isNarrow = useMediaQuery(theme.breakpoints.down('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorElUser, setAnchorElUser] = useState(null);
  
  // Handle responsive drawer behavior
  useEffect(() => {
    if (isNarrow) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isNarrow]);
  
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
      background: '#b4cef5ff', // nền trắng hơi xanh
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>
      {/* Modern Teacher AppBar */}
      <AppBar 
        position="fixed" 
        color="default"
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          width: { xs: '100%', lg: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, lg: `${drawerWidth}px` },
          background: '#ffffff',
          borderBottom: '1px solid #e0e7ef',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          transition: theme.transitions.create(['width', 'margin']),
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
          {isNarrow && (
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                background: '#e3f2fd',
                '&:hover': {
                  background: '#d3eafc',
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
            <SchoolIcon sx={{ mr: 1.5, fontSize: { xs: 24, md: 32 }, color: 'primary.main', flexShrink: 0 }} />
            <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
              <Typography 
                variant="h5" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
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
                  color: 'text.secondary',
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
                  alt={userProfile?.full_name || user?.user_metadata?.full_name || 'Teacher'}
                  sx={{
                    width: { xs: 36, md: 45 },
                    height: { xs: 36, md: 45 },
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    border: '2px solid #e0e7ef',
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 'bold',
                    color: 'primary.main'
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
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e0e7ef',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
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
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                    {userProfile?.full_name || user?.user_metadata?.full_name || 'Giáo viên x'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label="Teacher"
                    size="small"
                    sx={{
                      mt: 1,
                      background: '#e3f2fd',
                      color: 'primary.main',
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
        variant={isNarrow ? "temporary" : "permanent"} 
        open={drawerOpen}
        onClose={isNarrow ? handleDrawerToggle : undefined}
        sx={{
          width: { xs: drawerWidthMobile, md: drawerWidth },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: drawerWidthMobile, md: drawerWidth },
            boxSizing: 'border-box',
            background: '#ffffff',
            borderRight: '1px solid #e0e7ef',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
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
          p: { xs: 1.5, md: 2.5 }, 
          textAlign: 'center',
          background: '#f0f6ff',
          borderBottom: '1px solid #e0e7ef'
        }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              background: '#ffffff',
              borderRadius: '15px',
              border: '1px solid #e0e7ef',
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
                  color: 'text.primary',
                  fontWeight: 700,
                  fontSize: { xs: '0.95rem', md: '1.1rem' }
                }}
              >
              {userProfile?.full_name || user?.user_metadata?.full_name || 'Giáo viên'}
            </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  mt: 0.5,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}
              >
              Khu vực quản lý lớp học 📚
            </Typography>
          </Paper>
        </Box>
        
        {/* Teacher Info Card */}
  <Box sx={{ p: { xs: 1.25, md: 2 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              background: '#ffffff',
              borderRadius: '15px',
              border: '1px solid #e0e7ef',
              textAlign: 'center'
            }}
          >
            <Avatar
              sx={{
                width: { xs: 50, md: 60 },
                height: { xs: 50, md: 60 },
                mx: 'auto',
                mb: 1,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '2px solid #e0e7ef',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 'bold',
                color: 'primary.main'
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
              {userProfile?.full_name || user?.user_metadata?.full_name || 'Giáo viên'}
            </Typography>
            <Chip
              label="Teacher"
              size="small"
              sx={{
                mt: 1,
                background: '#e3f2fd',
                color: 'primary.main',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', md: '0.75rem' }
              }}
            />
          </Paper>
        </Box>
        
        {/* Navigation Menu */}
  <Box sx={{ flex: 1, px: { xs: 0.5, md: 1 }, pt: { xs: 0.5, md: 1 } }}>
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
                    minHeight: { xs: 48, md: 56 },
                    background: location.pathname === item.path 
                      ? '#e3f2fd' 
                      : 'transparent',
                    border: location.pathname === item.path 
                      ? '1px solid #bbdefb' 
                      : '1px solid transparent',
                    '&:hover': {
                      background: '#f0f6ff',
                      border: '1px solid #bbdefb',
                      transform: 'translateX(5px)',
                    },
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background: '#e3f2fd',
                      '&:hover': {
                        background: '#d3eafc',
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
                          ? `linear-gradient(135deg, #e3f2fd, #bbdefb)`
                          : '#f5f9ff',
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
                          fontSize: { xs: '0.8rem', md: '0.9rem' }
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.65rem', md: '0.75rem' },
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
  <Box sx={{ p: { xs: 1.25, md: 2 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1, md: 1.5 },
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e0e7ef',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                display: 'block',
                fontSize: { xs: '0.65rem', md: '0.75rem' }
              }}
            >
              Teacher Panel v1.0.0
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.disabled',
                display: 'block',
                fontSize: { xs: '0.6rem', md: '0.7rem' }
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
          width: { xs: '100%', lg: `calc(100% - ${drawerWidth}px)` },
          ml: { 
            xs: 0,
            md: 0
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: '100vh',
          background: '#f5f9ff',
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
            px: { xs: 1, md: 2 },
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            // Removed frosted overlay for clean white style
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default TeacherLayout;
