import React, { useState, useEffect } from 'react';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import { useNavigate,Link, useParams } from 'react-router-dom'; //เพิ่มเมื่อกดไปหน้าดีเทล


function Waitingpage() {
    const [borrowRequests, setBorrowRequests] = useState([]); // เก็บข้อมูลคำร้องทั้งหมด
    const [searchQuery, setSearchQuery] = useState(''); // เก็บค่าคำค้นหา
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [noteMap, setNoteMap] = useState({}); // เก็บหมายเหตุสำหรับแต่ละ borrow_id
    const navigate = useNavigate(); //เพิ่มเมื่อกดไปหน้าดีเทล

   // ฟังก์ชันดึงข้อมูลคำร้องทั้งหมด
  const fetchBorrowRequests = async () => {
    try {
      const response = await fetch('http://10.198.200.35:5002/waiting');
      const data = await response.json();
      if (response.ok) {
        setBorrowRequests(data);
        setError('');
      } else {
        setError(data.error || 'ไม่พบคำร้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false); // ตั้งค่า isLoading เป็น false เมื่อข้อมูลโหลดเสร็จ
    }
  };

  // เรียก fetchBorrowRequests เมื่อคอมโพเนนต์โหลดครั้งแรก
  useEffect(() => {
    fetchBorrowRequests();
  }, []);

    
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : '-';

  if (isLoading) {
    return <p>กำลังโหลดข้อมูล...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  
  
    // ฟังก์ชันกรองข้อมูลคำร้องตามคำค้นหา
    const filteredRequests = borrowRequests.filter(
      (borrow) =>
        borrow.stu_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${borrow.stu_fname} ${borrow.stu_lname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        borrow.stu_Engfaculty.toLowerCase().includes(searchQuery.toLowerCase())
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
                <h1 className="text-3xl mb-6 text-center font-sans text-blue">รายชื่อรอรับเครื่อง</h1>
  
                {/* ช่องค้นหา */}
                <div className="flex justify-center mb-4">
                  <input
                    type="text"
                    placeholder="ค้นหา รหัสนักศึกษา ชื่อ หรือคณะ..."
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
                        <th className="px-4 py-2 text-center font-semibold text-sm w-26">ลำดับคิว</th>
                        <th className="px-4 py-2 text-center font-semibold text-sm w-42">รหัสนักศึกษา</th>
                        <th className="px-4 py-2 text-center font-semibold text-sm w-42">ชื่อ-สกุล</th>
                        <th className="px-4 py-2 text-center font-semibold text-sm">คณะ</th>
                        <th className="px-4 py-2 text-center font-semibold text-sm">วันที่ส่งคำร้องขอยืม</th>
                        <th className="px-4 py-2 text-center font-semibold text-sm">เอกสาร</th>
                        <th className="px-4 py-2 text-center font-semibold text-sm">สถานะ</th>
                       
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map((borrow, index) => (
                          <tr
                          key={borrow.borrow_id}
                          className="border-b hover:bg-gray-100 cursor-pointer "
                          onClick={() => navigate(`/admin/DetailsWaiting/${borrow.borrow_id}`)}
                        >
                            <td className="px-4 py-2 text-center text-sm">{borrow.borrow_id}</td>
                            <td className="px-4 py-2 text-center text-sm">{borrow.stu_id}</td>
                            <td className="px-4 py-2 text-center text-sm">{`${borrow.stu_fname} ${borrow.stu_lname}`}</td>
                            <td className="px-4 py-2 text-center text-sm">{borrow.stu_Engfaculty}</td>
                            <td className="px-4 py-2 text-center text-sm">{new Date(borrow.request_date).toLocaleString('th-TH')}</td>
                            <td className="py-2 text-center px-2 ">
                            {borrow.document ? (
                              <a
                                href={`http://10.198.200.35:5002${borrow.document}`}   // เชื่อมโยงไปยัง document_path
                                target="_blank"  // เปิดใน tab ใหม่
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                                onClick={(event) => {
                                  event.stopPropagation(); // ป้องกันไม่ให้คลิกส่งต่อไปยัง handleRowClick
                                }}
                              >
                                {/* ไอคอน PDF */}
                                <i className="fa fa-file-pdf text-red-600" style={{ fontSize: '1.5rem' }}></i> {/* เพิ่มขนาดโดยใช้ style */}
                              </a>
                            ) : (
                              'ไม่มีเอกสาร'
                            )}
                          </td>
                            <td className={`px-4 py-2 text-sm text-center ${getStatusColor(borrow.status)}`}>
                              {borrow.status}
                            </td>
                            
                            
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
  

export default Waitingpage;