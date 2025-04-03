import React, { useState, useEffect } from 'react';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

function HomeAdmin() {
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [noteMap, setNoteMap] = useState({});

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const fetchBorrowRequests = async () => {
    try {
      const response = await fetch(`http://10.198.200.35:5002/ApproveRequest`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'ไม่พบคำร้อง');
      } else {
        setBorrowRequests(data);
        setError('');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  useEffect(() => {
    fetchBorrowRequests();
  }, []);

  const updateRequestStatus = async (borrow_id, action) => {
    try {
      const note = noteMap[borrow_id] || "";
      const response = await fetch(`http://10.198.200.35:5002/ApproveRequest/${borrow_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, note }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }

      await fetchBorrowRequests();
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const filteredRequests = borrowRequests.filter(
    (borrow) =>
      borrow.stu_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrow.stu_idcard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${borrow.stu_fname} ${borrow.stu_lname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrow.stu_Engfaculty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-LightGray">
      <Navadmin />
      <div className="flex flex-1">
        <Sideberadmin />
        <div className="flex-1 p-12">
          <div className="flex justify-center items-start mt-12">
            <div className="w-full max-w-8xl bg-white shadow-lg rounded-lg p-8">
              <h1 className="text-3xl mb-6 text-center font-sans text-blue">รายชื่อคำร้องขอยืม</h1>

              <div className="flex justify-center mb-4">
                <input
                  type="text"
                  placeholder="ค้นหา รหัสนักศึกษา ชื่อ หรือคณะ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {error && <div className="text-red-500 text-center mb-4">{error}</div>}

              <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-blue2 from-blue-500 to-blue-700 text-white">
                      <th className="px-0 py-2 text-center font-semibold text-sm">คิว</th>
                      {/* <th className="px-0 py-2 text-center font-semibold text-sm">หมายเลขบัตรประชาชน</th> */}
                      <th className="px-0 py-2 text-center font-semibold text-sm">รหัสนักศึกษา</th>
                      <th className="px-0 py-2 text-center font-semibold text-sm">ชื่อ-สกุล</th>
                      <th className="px-0 py-2 text-center font-semibold text-sm">คณะ</th>
                      <th className="px-0 py-2 text-center font-semibold text-sm">วันที่ส่งคำร้องขอยืม</th>
                      <th className="px-0 py-2 text-center font-semibold text-sm">เอกสาร</th>
                      <th className="px-0 py-2 text-center font-semibold text-sm">สถานะ</th>
                      <th className="px-0 py-2 text-center font-semibold text-sm">การตรวจสอบ</th>
                      <th className="px-0 py-2 text-center font-semibold text-sm">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((borrow, index) => (
                        <tr
                          key={borrow.borrow_id}
                          className="border-b hover:bg-gray-100 cursor-pointer"
                          onClick={() => navigate(`/admin/DetailsReq/${borrow.borrow_id}`)}
                        >
                          <td className="px-2 text-center py-2 text-sm w-10">{borrow.borrow_id}</td>
                          {/* <td className="px-3 py-2 text-sm">{borrow.stu_idcard}</td> */}
                          <td className="px-2 text-center py-2 text-sm">{borrow.stu_id}</td>
                          <td className="px-2 text-center py-2 text-sm">{`${borrow.stu_fname} ${borrow.stu_lname}`}</td>
                          <td className="px-2 text-center py-2 text-sm">{borrow.stu_Engfaculty}</td>
                          <td className="px-3 text-center py-2 text-sm">{new Date(borrow.request_date).toLocaleString('th-TH')}</td>
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
                                <i className="fa fa-file-pdf text-red-600" style={{ fontSize: '2rem' }}></i> {/* เพิ่มขนาดโดยใช้ style */}
                              </a>
                            ) : (
                              'ไม่มีเอกสาร'
                            )}
                          </td>
                          <td className={`px-4 py-2 text-center text-sm ${getStatusColor(borrow.status)}`}>
                            {borrow.status}
                          </td>
                          <td className="px-4 py-2 text-center text-sm">
                            <div className="flex justify-center items-center space-x-3">
                              <span
                                className="text-green-500 cursor-pointer border border-green-500 rounded-full px-2 py-1"
                                onClick={(e) => {
                                  e.stopPropagation(); // ป้องกัน propagation
                                  updateRequestStatus(borrow.borrow_id, 'approve'); // ส่ง action "approve"
                                }}
                              >
                                ✔
                              </span>
                              <span
                                className="text-red-500 cursor-pointer border border-red-500 rounded-full px-2 py-1"
                                onClick={(e) => {
                                  e.stopPropagation(); // ป้องกัน propagation
                                  updateRequestStatus(borrow.borrow_id, 'reject'); // ส่ง action "reject"
                                }}
                              >
                                ✖
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-2 text-center text-sm">
                            <input
                              type="text"
                              value={noteMap[borrow.borrow_id] || ''}
                              onChange={(e) =>
                                setNoteMap((prev) => ({
                                  ...prev,
                                  [borrow.borrow_id]: e.target.value,
                                }))
                              }
                              onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้คลิกส่งต่อไปยังแถว
                              className="border border-gray-300 rounded-lg w-32 p-1"
                              placeholder="หมายเหตุ"
                            />
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

              {/* Pagination */}
              <div className="flex justify-center mt-4">
                {/* ปุ่มย้อนกลับ */}
                <button
                  className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue text-white hover:bg-blue-700'}`}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ย้อนกลับ
                </button>

                {/* ข้อความแสดงหมายเลขหน้า */}
                <span className="px-4 py-2 text-lg">
                  หน้า {currentPage} / {totalPages}
                </span>

                {/* ปุ่มถัดไป */}
                <button
                  className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue text-white hover:bg-blue-700'}`}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeAdmin;
