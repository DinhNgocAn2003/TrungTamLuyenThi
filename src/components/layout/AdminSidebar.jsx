import React from 'react';
import { NavLink } from 'react-router-dom';
import { Dashboard, Person, School, Assignment, Payment, EventNote, Assessment } from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Quản lý học sinh', icon: <Person />, path: '/admin/students' },
  { text: 'Quản lý lớp học', icon: <School />, path: '/admin/classes' },
  { text: 'Đăng ký học', icon: <Assignment />, path: '/admin/enrollments' },
  { text: 'Thanh toán', icon: <Payment />, path: '/admin/payments' },
  { text: 'Điểm danh', icon: <EventNote />, path: '/admin/attendance' },
  { text: 'Báo cáo', icon: <Assessment />, path: '/admin/reports' },
];

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink to={item.path} key={index} className="menu-item">
            {item.icon}
            <span>{item.text}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;