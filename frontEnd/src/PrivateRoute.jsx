import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('stu_email'); // เช็คว่าเข้าสู่ระบบหรือยัง

  return isLoggedIn ? children : <Navigate to="/login" />; // ถ้าเข้าสู่ระบบแล้ว ให้แสดง children ถ้าไม่ให้ไปที่หน้า login
};

export default PrivateRoute;
