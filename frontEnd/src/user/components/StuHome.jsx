import React, { useEffect, useState } from 'react';
import Slidebar from './Sidebar';
import Nav from './Nav';
import { format } from 'date-fns';
import Swal from 'sweetalert2'; // Import SweetAlert2

function StuHome() {
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [facultyData, setFacultyData] = useState([]); // กำหนด facultyData ไว้ใน state
  const [controlRequest, fetchControlRequest] = useState([]);
  const stuEmail = localStorage.getItem('stu_email');

  useEffect(() => {
    const fetchBorrowHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5002/reqHistory?stu_email=${stuEmail}`);
        const data = await response.json();
        setBorrowHistory(data);
      } catch (error) {
        console.error('Error fetching borrow history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchFacultyData = async () => {
      try {
        const response = await fetch(`http://localhost:5002/StuHome?stu_email=${stuEmail}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // แยกข้อมูล facultyData
        if (data.facultyData && data.facultyData.length > 0) {
          setFacultyData(data.facultyData);
        } else {
          console.warn('No faculty data available.');
          setFacultyData([]); // ตั้งค่าว่างเมื่อไม่มีข้อมูล
        }
      } catch (error) {
        console.error('Error fetching faculty data:', error);
      }
    };
    // const fetchControlRequest = async () => {
    //   try {
    //     const response = await fetch(`http://localhost:3000/StuHome?stu_email=${stuEmail}`);
    //     const data = await response.json();
    //     fetchControlRequest(data);
    //   } catch (error) {
    //     console.error('Error fetching control request :', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    fetchBorrowHistory();
    fetchFacultyData();
    // fetchControlRequest();
  }, [stuEmail]);


  const deleteRequest = async (borrow_id) => {
    try {
      const response = await fetch('http://localhost:5002/deleteRequestStudent', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ borrow_id }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: data.message,
          confirmButtonText: 'ตกลง',
        }).then(() => {
          // Refresh borrow history after deletion
          setBorrowHistory((prev) => prev.filter((item) => item.borrow_id !== borrow_id));
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: data.message,
          confirmButtonText: 'ตกลง',
        });
      }
    } catch (error) {
      console.error('Error deleting borrow request:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  // const viewDocument = (borrowId) => {
  //   // สร้าง URL สำหรับดูเอกสาร
  //   const fileUrl = `http://localhost:3000/viewDocument?borrow_id=${borrowId}`;
  //   return fileUrl;
  // };

  const displayValue = (value) => (value ? value : '-');
  const displayDate = (date) => date ? format(new Date(date), 'dd/MM/yyyy') : '-';

  const getStatusColor = (status) => {
    switch (status) {
      case 'อนุมัติ':
        return 'text-green-600';
      case 'รอตรวจสอบ':
        return 'text-yellow-600';
      case 'ถูกปฏิเสธ':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const isCancellable = (status) => {
    return status === 'รอตรวจสอบ' || status === 'รอรับเครื่อง';
  };

  return (
    <div className="flex bg-LightGray flex-col min-h-screen font-sans">
      <Nav />
      <div className="flex flex-1">
        <Slidebar />
        <div className="flex-1 p-12 overflow-x-auto">
          <h1 className="text-3xl mt-12 mb-6 text-center font-sans text-blue2">หน้าเเรกยืม</h1>


          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-blue2 text-white">
                  <th className="px-4 py-4 text-center font-semibold">ชื่อคณะ</th>
                  <th className="px-4 py-4 text-center font-semibold">จำนวนโน๊ตบุ๊คทั้งหมด</th>
                  <th className="px-4 py-4 text-center font-semibold">จำนวนโน๊ตบุ๊คที่ยืมไป</th>
                </tr>
              </thead>
              <tbody>
                {facultyData.length > 0 ? (
                  facultyData.map((faculty) => (
                    <tr key={faculty.faculty_name}>
                      <td className="px-4 py-4 text-center">{faculty.faculty_name}</td>
                      <td className="px-4 py-4 text-center">{faculty.number}</td>
                      <td className="px-4 py-4 text-center">{faculty.Amount_borrowed}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center px-4 py-4">ไม่มีข้อมูลคณะ</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-blue2 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">ลำดับคิว</th>
                  <th className="py-3 px-4 text-left">วันที่ส่งคำขอยืม</th>
                  <th className="py-3 px-4 text-left">วันที่ยืม</th>
                  <th className="py-3 px-4 text-left">วันที่คืน</th>
                  <th className="py-3 px-4 text-left">พยาน</th>
                  <th className="py-3 px-4 text-left">สถานะ</th>
                  <th className="px-3 py-4 text-left">ยกเลิกคำร้อง</th>
                </tr>

              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">กำลังโหลด...</td>
                  </tr>
                ) : borrowHistory.length > 0 ? (
                  borrowHistory.map((borrow) => (
                    <tr key={borrow.borrow_id} className="border-b hover:bg-gray-100">
                      <td className="py-3 px-4">{borrow.borrow_id}</td>
                      <td className="py-3 px-4">{displayDate(borrow.request_date)}</td>
                      <td className="py-3 px-4">{displayDate(borrow.borrow_date)}</td>
                      <td className="py-3 px-4">{displayDate(borrow.return_date)}</td>
                      <td className="py-3 px-4">
                        {displayValue(borrow.witness_fname)} {displayValue(borrow.witness_lname)}
                      </td>
                      <td className={`py-3 px-4 ${getStatusColor(borrow.status)}`}>
                        {displayValue(borrow.status)}
                      </td>
                      <td className="px-3 py-4 flex items-center">
                        <span
                            className={`${
                                isCancellable(borrow.status)
                                    ? 'text-red-500 cursor-pointer border-red-500'
                                    : 'text-gray-400 border-gray-400 cursor-not-allowed'
                            } border rounded-full px-2 py-1 inline-block ml-7`}
                            onClick={(e) => {
                                if (isCancellable(borrow.status)) {
                                    e.stopPropagation(); // ป้องกัน propagation
                                    deleteRequest(borrow.borrow_id); // เรียกฟังก์ชัน deleteRequest
                                }
                            }}
                        >
                            ✖
                        </span>
                      </td>


                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">ไม่มีประวัติการยืม</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StuHome;
