import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

function Navadmin() {
  const [isOpen, setIsOpen] = useState(false);
  const [officerData, setOfficerData] = useState(null); // สำหรับเก็บข้อมูลเจ้าหน้าที่
  const [loading, setLoading] = useState(true); // สำหรับแสดงสถานะกำลังโหลด

  const officerEmail = localStorage.getItem('stu_email'); // ดึง email จาก localStorage หรือจาก state อื่น ๆ

  // ฟังก์ชันดึงข้อมูลเจ้าหน้าที่จาก API
  useEffect(() => {
    if (officerEmail) {
      fetch(`http://localhost:5002/navOfficerData?officer_email=${officerEmail}`)
        .then((response) => response.json())
        .then((data) => {
          setOfficerData(data[0]); // เก็บข้อมูลเจ้าหน้าที่ตัวแรก (สมมุติว่าเราจะได้แค่ 1 ผลลัพธ์)
          setLoading(false); // เปลี่ยนสถานะเป็นไม่โหลด
        })
        .catch((error) => {
          console.error('Error fetching officer data:', error);
          setLoading(false);
        });
    }
  }, [officerEmail]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const handleLogout = () => {
    localStorage.removeItem('stu_email'); // ลบข้อมูลออกจาก localStorage
    window.location.href = 'http://localhost:5002/login'; // เปลี่ยนเส้นทางไปหน้า login
  };

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>; // แสดงข้อความเมื่อยังโหลดข้อมูล
  }

  return (
    <nav className="w-full bg-LightGray text-white p-4 fixed top-0 z-10">
      <div className="container flex justify-between items-center" style={{ marginLeft: 'auto', marginRight: '40px' }}>
        <h1 className="text-xl font-bold"></h1>
        <div className="flex items-center space-x-4">
          {/* แสดงชื่อและนามสกุลของเจ้าหน้าที่ */}
          {officerData && (
            <div className="flex flex-col items-end text-black">
              <span className="text-xl">{officerData.officer_fname} {officerData.officer_lname}</span>
              <span className="text-M">เจ้าหน้าที่</span>
            </div>
          )}

          {/* ปุ่มสำหรับเปิด/ปิด dropdown */}
          <div className="relative">
            <button onClick={toggleDropdown} className="focus:outline-none text-black">
              <FontAwesomeIcon icon={faUserCircle} size="lg" />
            </button>

            {/* เมนูดรอปดาวน์ */}
            {isOpen && (
              <ul className="dropdown-menu absolute right-0 mt-2 w-48 bg-white text-black shadow-md rounded-lg py-2">
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">Profile</li>
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                  <Link to="/login">Logout</Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navadmin;
