import React, { useState, useEffect } from 'react';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import { useNavigate } from 'react-router-dom'; // เพิ่มการ import useNavigate
import { Link } from 'react-router-dom'; // Make sure Link is imported for routing
import Swal from 'sweetalert2';
import axios from 'axios';

function AllNotebookDT() {
  const [notebookDetails, setNotebookDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // เปลี่ยนชื่อตัวแปร
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // เพิ่ม state สำหรับ loading
  const navigate = useNavigate(); // สร้าง navigate function

  const [selectedNotebooks, setSelectedNotebooks] = useState([]); //เพิ่ม state เพื่อเก็บค่ารายการที่ถูกเลือก

  //ฟังก์ชันเลือก/ยกเลิกเลือก Notebook
  const toggleSelectNotebook = (laptop_tag) => {
    setSelectedNotebooks(prevSelected =>
      prevSelected.includes(laptop_tag)
        ? prevSelected.filter(tag => tag !== laptop_tag) // เอาออกถ้าถูกเลือกซ้ำ
        : [...prevSelected, laptop_tag] // เพิ่มถ้ายังไม่ถูกเลือก
    );
  };

  //ฟังก์ชันเลือกทั้งหมด
  const toggleSelectAll = () => {
    if (selectedNotebooks.length === paginatedNotebooks.length) {
      setSelectedNotebooks([]); // ถ้าทุกอันถูกเลือก → ยกเลิกทั้งหมด
    } else {
      setSelectedNotebooks(paginatedNotebooks.map(n => n.laptop_tag)); // เลือกทั้งหมด
    }
  };

  //ฟังก์ชันลบข้อมูลที่เลือก
  const deleteSelectedNotebooks = async () => {
    if (selectedNotebooks.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือก Notebook ที่ต้องการลบ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "รายการที่เลือกจะถูกลบอย่างถาวร!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch("http://10.198.200.35:5002/deleteSelectedNotebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ laptop_tags: selectedNotebooks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error deleting notebooks: ${response.status} ${errorData?.error || response.statusText}`);
      }

      // อัปเดต UI โดยเอารายการที่ถูกลบออก
      setNotebookDetails((prevNotebooks) =>
        prevNotebooks.filter((n) => !selectedNotebooks.includes(n.laptop_tag))
      );
      setSelectedNotebooks([]); // ล้างค่าที่เลือก

      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ!",
        text: "รายการที่เลือกถูกลบแล้ว",
        confirmButtonText: "ตกลง",
      }).then(() => {
        window.location.reload(); // รีโหลดหน้าเพื่ออัปเดต UI
      });

    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error);
      setError(error.message);

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        confirmButtonText: "ตกลง",
      });
    }
  };


  useEffect(() => {
    const fetchNotebookDetails = async () => {
      setLoading(true); // ตั้งค่า loading เป็น true ก่อน fetch
      try {
        const response = await fetch('http://10.198.200.35:5002/allNotebook');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error fetching notebook details: ${response.status} ${errorData?.error || response.statusText}`);
        }
        const data = await response.json();
        setNotebookDetails(data);
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
        setError(err.message);
      } finally {
        setLoading(false); // ตั้งค่า loading เป็น false หลัง fetch เสร็จสิ้น (ไม่ว่าสำเร็จหรือล้มเหลว)
      }
    };

    fetchNotebookDetails();
  }, []);

  const filteredNotebooks = notebookDetails.filter((notebook) => {
    if (!searchTerm && !statusFilter) return true; // ถ้าไม่มีการค้นหาและ filter ให้แสดงทั้งหมด

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      notebook.laptop_tag?.toLowerCase().includes(searchLower) ||
      notebook.brand?.toLowerCase().includes(searchLower) ||
      notebook.model?.toLowerCase().includes(searchLower) ||
      notebook.serial_number?.toLowerCase().includes(searchLower) ||
      notebook.barcode_id?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter ? notebook.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredNotebooks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotebooks = filteredNotebooks.slice(startIndex, startIndex + itemsPerPage);

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (direction) => {
    setCurrentPage(prev => Math.max(1, Math.min(totalPages, direction === 'next' ? prev + 1 : prev - 1)));
  };


  const handleStatusChange = async (e, laptop_tag) => {
    const newStatus = e.target.value;
    try {
      const response = await fetch('http://10.198.200.35:5002/updateStatusAllNotebook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laptop_tag, status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error updating status: ${response.status} ${errorData?.error || response.statusText}`);
      }
      setNotebookDetails(prevDetails => prevDetails.map(notebook =>
        notebook.laptop_tag === laptop_tag ? { ...notebook, status: newStatus } : notebook
      ));
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ:', error);
      setError(error.message);
    }
  };


  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading) { // ใช้ loading state ในการแสดง loading message
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  const statusOptions = [
    { value: '', label: 'ทั้งหมด' },
    // { value: 'รอตรวจสอบ', label: 'รอตรวจสอบ' },
    { value: 'ใช้งานได้', label: 'ใช้งานได้' },
    { value: 'กำลังใช้งาน', label: 'กำลังใช้งาน' },
    { value: 'ซ่อม', label: 'ซ่อม' },
    { value: 'ไม่ใช้งาน', label: 'ไม่ใช้งาน' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-LightGray">
      <Navadmin />
      <div className="flex flex-1">
        <Sideberadmin />
        <div className="flex-1 p-12">
          <div className="flex flex-col items-center mt-5">
            <div className="w-full max-w-7xl bg-white shadow-lg rounded-lg p-8 mt-7">
              <div className="flex items-center justify-between mb-10">
                <h1 className="text-3xl text-center font-sans text-blue">ข้อมูลรายชื่อเครื่อง</h1>
                <div className="flex justify-between items-center gap-4">
                  <a href="/create_file (2).pdf" download>
                    <button className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
                      ตัวอย่างไฟล์เพิ่มเครื่อง
                    </button>
                  </a>
                  <Link to="/admin/Details">
                    <button className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
                      เพิ่ม
                    </button>
                  </Link>
                </div>


                {/* <button
                  type="button"
                  onClick={handleDelete}
                  // disabled={!isEditing}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  ลบข้อมูล
                </button> */}
              </div>


              {/* Search Section */}
              <div className="flex items-center justify-center mb-10">
                <input
                  type="text"
                  placeholder="ค้นหา หมายเลขเครื่อง แบรนด์ โมเดล Serial Barcode..."
                  className="p-3 border border-gray-300 rounded-lg mr-4 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm} // ใช้ searchTerm
                  onChange={(e) => setSearchTerm(e.target.value)} // อัปเดต searchTerm
                />

                <select
                  className="p-3 border border-blue bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue" // สไตล์ที่แก้ไข
                  value={statusFilter} // ใช้ state statusFilter
                  onChange={(e) => setStatusFilter(e.target.value)} // อัปเดต state statusFilter
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  className=" bg-redd text-white py-1 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300  bottom-5"
                  onClick={deleteSelectedNotebooks}
                  disabled={selectedNotebooks.length === 0}
                >
                  ลบที่เลือก
                </button>
              </div>


              {/* ตารางแสดงข้อมูล */}

              <div className="overflow-x-auto rounded-lg shadow-sm mt-5">
                <table className="min-w-full table-auto bg-white rounded-lg shadow-md">

                  <thead>

                    <tr className="bg-blue text-white">
                      <th className="px-3 py-1 text-left font-semibold">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={selectedNotebooks.length === paginatedNotebooks.length && paginatedNotebooks.length > 0}
                        />
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">หมายเลขเครื่อง</th>
                      <th className="px-2 py-2 text-left font-semibold">แบรนด์</th>
                      <th className="px-2 py-2 text-left font-semibold">โมเดล</th>
                      <th className="px-2 py-2 text-left font-semibold">serial_number</th>
                      <th className="px-2 py-2 text-left font-semibold">หมายเลขบาร์โค้ด</th>
                      <th className="px-2 py-2 text-left font-semibold">สถานะ</th>
                      <th className="px-2 py-2 text-left font-semibold">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedNotebooks.length > 0 ? (
                      paginatedNotebooks.map((notebook) => {
                        const isDisabled = notebook.status === 'ไม่ใช้งาน'; // ✅ กำหนดค่าไว้ก่อน return

                        return (
                          <tr
                            key={notebook.laptop_tag}
                            onClick={() => !isDisabled && navigate(`/admin/EditDetailNotebook/${notebook.laptop_tag}`)}
                            className={`cursor-pointer hover:bg-gray-100 ${isDisabled ? 'pointer-events-none bg-white-200 text-gray-500 ' : ''}`}
                          >
                            <td className="px-3 py-1 text-left font-semibold">
                              <input
                                type="checkbox"
                                checked={selectedNotebooks.includes(notebook.laptop_tag)}
                                onChange={() => toggleSelectNotebook(notebook.laptop_tag)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-4 py-2">{notebook.laptop_tag || '-'}</td>
                            <td className="px-2 py-2">{notebook.brand || '-'}</td>
                            <td className="px-2 py-2">{notebook.model || '-'}</td>
                            <td className="px-2 py-2">{notebook.serial_number || '-'}</td>
                            <td className="px-2 py-2">{notebook.barcode_id || '-'}</td>
                            <td className="px-2 py-2">
                              <select
                                value={notebook.status || 'รอตรวจสอบ'}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleStatusChange(e, notebook.laptop_tag)}
                                disabled={isDisabled} // ✅ ปิด dropdown ถ้าเป็น 'ไม่ใช้งาน'
                                className={`bg-white border rounded-lg px-2 text-center
                                  ${notebook.status === 'ใช้งานได้' ? 'bg-green-100 text-green-700 border-green-500' :
                                    notebook.status === 'กำลังใช้งาน' ? 'bg-indigo-100 text-indigo-700 border-indigo-500' :
                                      notebook.status === 'ซ่อม' ? 'bg-red-100 text-red-700 border-red-500' :
                                        notebook.status === 'ไม่ใช้งาน' ? 'bg-gray-100 text-gray-700 border-gray-500' :
                                          isDisabled ? 'bg-gray-300 text-gray-500 border-gray-400' : ''
                                  }`}
                              >
                                {isDisabled ? (
                                  <option value="ไม่ใช้งาน">ไม่ใช้งาน</option> // ✅ แสดง "ไม่ใช้งาน" ถ้าปิดการใช้งาน
                                ) : (
                                  <>
                                    {/* <option value="รอตรวจสอบ">รอตรวจสอบ</option> */}
                                    <option value="ใช้งานได้">ใช้งานได้</option>
                                    <option value="กำลังใช้งาน">กำลังใช้งาน</option>
                                    <option value="ซ่อม">ซ่อม</option>
                                    {/* <option value="ไม่ใช้งาน">ใช้งานไม่ได้</option> */}
                                  </>
                                )}
                              </select>
                            </td>
                            <td className="px-2 py-2">{notebook.note || '-'}</td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          ไม่มีข้อมูลที่จะแสดง
                        </td>
                      </tr>
                    )}
                  </tbody>


                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center mt-4">
                <button
                  className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue text-white hover:bg-blue-700'}`}
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 1}
                >
                  ย้อนกลับ
                </button>

                <span className="px-4 py-2">หน้า {currentPage} / {totalPages}</span>

                <button
                  className="px-4 py-2 bg-blue text-white rounded-lg disabled:opacity-50"
                  onClick={() => handlePageChange('next')}
                  disabled={currentPage >= totalPages}
                >
                  ถัดไป
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default AllNotebookDT;
