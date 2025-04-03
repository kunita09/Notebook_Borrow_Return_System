import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Register() {
  const [stu_no, setStuNo] = useState('');
  const [stu_fname, setFirstName] = useState('');
  const [stu_lname, setLastName] = useState('');
  const [stu_email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stu_id, setStudentId] = useState('');
  const [stu_idcard, setIdCard] = useState('');
  const [stu_faculty, setFaculty] = useState('');
  const [college_years, setYear] = useState('');
  const [stu_phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const faculties = ['คณะครุศาสตร์', 'วิศวะ', 'หมอ', 'คอม'];
  const years = ['1', '2', '3', '4'];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stu_no || !stu_fname || !stu_lname || !stu_email || !password || !stu_id || !stu_idcard || !stu_faculty || !college_years || !stu_phone) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const response = await fetch(`http://10.198.200.35:5002/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stu_no,
          stu_fname,
          stu_lname,
          stu_email,
          password,
          stu_id,
          stu_idcard,
          stu_faculty, // ส่งคณะเป็นชื่อเหมือนหลังบ้านต้องการ
          college_years,
          stu_phone
        })
      });

      if (response.ok) {
        navigate(`/login`);
        // setStuNo(data[0].stu_no)
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          Register หน้านี้ไม่เกี่ยวกับการประเมิน
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>


          <div className="flex space-x-4 mb-4">
            <div className="w-1/4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
                ลำดับ
              </label>
              <input
                type="text"
                id="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
                placeholder="กรุณากรอกลำดับ"
                value={stu_no}
                onChange={(e) => setStuNo(e.target.value)}
              />
            </div>

            <div className="w-5/12">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                ชื่อ
              </label>
              <input
                type="text"
                id="firstName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
                placeholder="กรุณากรอกชื่อ"
                value={stu_fname}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="w-5/12">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                นามสกุล
              </label>
              <input
                type="text"
                id="lastName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
                placeholder="กรุณากรอกนามสกุล"
                value={stu_lname}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>


          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentId">
                รหัสนักศึกษา
              </label>
              <input
                type="text"
                id="studentId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
                placeholder="กรุณากรอกรหัสนักศึกษา"
                value={stu_id}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="idCard">
                เลขบัตรประชาชน (สมมุติขึ้นมาได้)
              </label>
              <input
                type="text"
                id="idCard"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
                placeholder="กรุณากรอกเลขบัตรประชาชน"
                value={stu_idcard}
                onChange={(e) => setIdCard(e.target.value)}
              />
            </div>


          </div>

          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                อีเมล
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
                placeholder="กรุณากรอกอีเมล"
                value={stu_email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                รหัสผ่าน
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
                placeholder="กรุณากรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>


          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="faculty">
              คณะ
            </label>
            <select
              id="faculty"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
              value={stu_faculty}
              onChange={(e) => setFaculty(e.target.value)}
            >
              <option value="">เลือกคณะ</option>
              {faculties.map((facultyOption, index) => (
                <option key={index} value={facultyOption}>
                  {facultyOption}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">
              ชั้นปี
            </label>
            <select
              id="year"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
              value={college_years}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">เลือกชั้นปี</option>
              {years.map((yearOption, index) => (
                <option key={index} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              เบอร์โทรศัพท์
            </label>
            <input
              type="text"
              id="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
              placeholder="กรุณากรอกเบอร์โทรศัพท์"
              value={stu_phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue to-blue text-white py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
          >
            สมัครสมาชิก
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
