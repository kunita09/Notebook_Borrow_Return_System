import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const apiFetch = async (url, options) => {
    const stuEmail = localStorage.getItem('stu_email');
    const officerEmail = localStorage.getItem('officer_email');
    const headers = {
      'Content-Type': 'application/json',
      ...(stuEmail && { 'stu_email': stuEmail }),
      ...(officerEmail && { 'officer_email': officerEmail })
    };

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    return response;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    const url = 'http://localhost:5002/login';

    try {
      const response = await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();

        // บันทึกข้อมูลใน localStorage
        localStorage.setItem('stu_email', email);
        localStorage.setItem('officer_email', data.officer_email || '');

        // ตรวจสอบ role และนำทางไปยังหน้าแรกที่เหมาะสม
        switch (data.role) {
          case 'admin':
            navigate('/admin/Home');
            break;
          case 'student':
            navigate('/StuHome');
            break;
          default:
            setError('บทบาทของผู้ใช้ไม่ถูกต้อง');
            break;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} >
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;