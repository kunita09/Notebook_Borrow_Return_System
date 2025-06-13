import React, { useState, useEffect } from 'react';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import { useNavigate } from 'react-router-dom'; //เพิ่มเมื่อกดไปหน้าดีเทล

function Pageborrowing() {
  const [borrowRequests, setBorrowRequests] = useState([]); // เก็บข้อมูลคำร้องทั้งหมด
  const [searchQuery, setSearchQuery] = useState(''); // เก็บค่าคำค้นหา
  const [error, setError] = useState('');
  const [noteMap, setNoteMap] = useState({}); // เก็บหมายเหตุสำหรับแต่ละ borrow_id
  
  const navigate = useNavigate(); //เพิ่มเมื่อกดไปหน้าดีเทล

  // ฟังก์ชันดึงข้อมูลคำร้องทั้งหมด
  const fetchBorrowRequests = async () => {
    try {
      const response = await fetch('http://localhost:5002/checkBorrowStatus');
      const data = await response.json();
      if (response.ok) {
        setBorrowRequests(data);
        setError('');
      } else {
        setError(data.error || 'ไม่พบคำร้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  // โหลดคำร้องเมื่อหน้าโหลด
  useEffect(() => {
    fetchBorrowRequests();
  }, []);

  // ฟังก์ชันกรองข้อมูลคำร้องตามคำค้นหา
  const filteredRequests = borrowRequests.filter(
    (borrow) =>
      borrow.stu_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${borrow.stu_fname} ${borrow.stu_lname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrow.stu_Engfaculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrow.laptop_tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'ยืมสำเร็จ':
        return 'text-green-600';
      case 'รอตรวจสอบ':
        return 'text-yellow-600';
      case 'ถูกปฏิเสธ':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-LightGray">
      <Navadmin />
      <div className="flex flex-1">
        <Sideberadmin />
        <div className="flex-1 p-12">
          <div className="flex justify-center items-start mt-12">
            <div className="w-full max-w-8xl bg-white shadow-lg rounded-lg p-8">
              <h1 className="text-3xl mb-6 text-center font-sans text-blue">รายชื่อรับเครื่องเรียบร้อย</h1>

              {/* ช่องค้นหา */}
              <div className="flex justify-center mb-4">
                <input
                  type="text"
                  placeholder="ค้นหา รหัสนักศึกษา ชื่อ คณะ หรือหมายเลขเครื่อง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Error Message */}
              {error && <div className="text-red-500 text-center mb-4">{error}</div>}

              {/* Table Section */}
              <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-blue2 from-blue-500 to-blue-700 text-white">
                      <th className="px-4 py-2 text-center font-semibold text-sm">ลำดับคิว</th>
                      {/* <th className="px-4 py-2 text-center font-semibold text-sm">หมายเลขบัตรประชาชน</th> */}
                      <th className="px-4 py-2 text-center font-semibold text-sm">รหัสนักศึกษา</th>
                      <th className="px-4 py-2 text-center font-semibold text-sm">ชื่อ-สกุล</th>
                      <th className="px-4 py-2 text-center font-semibold text-sm">คณะ</th>
                      <th className="px-4 py-2 text-center font-semibold text-sm">วันที่ส่งคำร้องขอยืม</th>
                      <th className="px-4 py-2 text-center font-semibold text-sm">วันที่รับเครื่อง</th>
                      <th className="px-4 py-2 text-center font-semibold text-sm">สถานะ</th>
                      <th className="px-4 py-2 text-center font-semibold text-sm">หมายเลขเครื่อง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((borrow, index) => (
                        <tr
                        key={borrow.borrow_id}
                        className="border-b hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/admin/Detailsborrowing/${borrow.borrow_id}`)}
                      >
                          <td className="px-4 py-2 text-center text-sm">{borrow.borrow_id}</td>
                          {/* <td className="px-4 py-2 text-sm">{borrow.stu_idcard}</td> */}
                          {/* เพิ่มเเล้วเพิ่มค้นหาด้วย */}
                          <td className="px-4 py-2 text-center text-sm">{borrow.stu_id}</td>
                          <td className="px-4 py-2 text-center text-sm">{`${borrow.stu_fname} ${borrow.stu_lname}`}</td>
                          <td className="px-4 py-2 text-center text-sm">{borrow.stu_Engfaculty}</td>
                          <td className="px-4 py-2 text-center text-sm">{new Date(borrow.request_date).toLocaleString('th-TH')}</td>
                          <td className="px-4 py-2 text-center text-sm">{new Date(borrow.borrow_date).toLocaleString('th-TH')}</td>
                          {/* <td
                            className="px-4 py-2 text-sm cursor-pointer text-blue-500"
                            onClick={() => openDocument(borrow.document)}
                          >
                            {borrow.document}
                          </td> */}
                          <td className={`px-4 py-2 text-center text-sm ${getStatusColor(borrow.status)}`}>
                            {borrow.status}
                          </td>
                          <td className="px-4 py-2 text-center text-sm">{borrow.laptop_tag}</td>
                          
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-2">
                          ไม่พบคำร้อง
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pageborrowing;
