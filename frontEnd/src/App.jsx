import { useState, useEffect } from 'react';
import Home from './user/components/StuHome';
import Login from './user/components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ตรวจสอบสถานะการล็อกอินเมื่อแอปเริ่มต้นทำงาน
  useEffect(() => {
    const stuEmail = localStorage.getItem('stu_email'); // ดึงอีเมลจาก localStorage
    if (stuEmail) {
      setIsLoggedIn(true); // ตั้งค่า isLoggedIn เป็น true หากพบข้อมูลใน localStorage
    }
  }, []);

  const handleLoginSuccess = (email) => {
    // เมื่อผู้ใช้ล็อกอินสำเร็จ
    localStorage.setItem('stu_email', email); // บันทึกอีเมลใน localStorage
    setIsLoggedIn(true); // อัปเดตสถานะเป็นล็อกอินแล้ว
  };

  return (
    <>
      {isLoggedIn ? (
        <Home />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
