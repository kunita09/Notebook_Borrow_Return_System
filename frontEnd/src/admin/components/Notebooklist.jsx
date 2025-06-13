import React, { useState, useEffect } from 'react';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import { Link, useNavigate } from 'react-router-dom';

import { FaTrash, FaEdit } from "react-icons/fa";

function Notebooklist() {

  const [notebooks, setNotebooks] = useState([]);
  const navigate = useNavigate();

  const fetchNotebookData = async () => {
    try {
      const response = await fetch('http://localhost:5002/notebooklist');
      const data = await response.json();

      if (response.ok) {
        const uniqueNotebooks = Array.from(new Set(data.map(item => item.model)))
          .map(model => data.find(item => item.model === model));

        setNotebooks(uniqueNotebooks);
      } else {
        console.error('Error fetching data:', data);
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
    }
  };

  useEffect(() => {
    fetchNotebookData();
  }, []);

  const handleDelete = async (barcode_id) => {
    const notebookToDelete = notebooks.find((notebook) => notebook.barcode_id === barcode_id);

    if (!notebookToDelete) {
      console.error('ไม่พบโน้ตบุ๊คที่ต้องการลบ');
      return;
    }

    const { brand, model } = notebookToDelete;

    try {
      const response = await fetch('http://localhost:5002/notebookDelete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brand, model }),  // ส่งข้อมูลที่ต้องการลบ
      });

      const data = await response.json();

      if (response.ok) {
        // // ลบโน้ตบุ๊คจาก state เพื่ออัพเดต UI
        // setNotebooks((prevNotebooks) =>
        //   prevNotebooks.filter((notebook) => notebook.barcode_id !== barcode_id)
        // );
        console.log(data.message);
        // ดึงข้อมูลใหม่จาก API หลังจากการลบ
        fetchNotebookData();
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบ:', error);
    }
  };

  const handleRowClick = (notebook) => {
    console.log('Navigating to NotebookDetail with brand and model:', notebook.brand, notebook.model); // Debug log
    navigate('/admin/notebookdetail', { state: { brand: notebook.brand, model: notebook.model } });
  };






  return (
    <div className="flex flex-col min-h-screen bg-LightGray">
      <Navadmin />
      <div className="flex flex-1">
        <Sideberadmin />
        <div className="flex-1 p-12">
          <div className="flex flex-col items-center mt-12">
            <div className="w-full max-w-7xl bg-white shadow-lg rounded-lg p-8">
              <div className="flex items-center justify-between mb-10">
                <h1 className="text-3xl mb-6 text-center font-sans text-blue">ข้อมูลรายชื่อเครื่อง</h1>

                <button className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
                  <Link to="/admin/Details" className="text-white">เพิ่ม</Link>
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-blue text-white">
                      <th className="px-4 py-2 text-left font-semibold">ลำดับ</th>
                      <th className="px-2 py-2 text-left font-semibold">แบรนด์</th>
                      <th className="px-2 py-2 text-left font-semibold">โมเดล</th>
                      <th className="px-4 py-2 text-left font-semibold">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notebooks.map((notebook, index) => (
                      <tr
                        key={notebook.barcode_id || index} // ใช้ barcode_id เป็น key หากมีค่า ถ้าไม่มีให้ใช้ index
                        className="border-b hover:bg-gray-50 transition duration-200 cursor-pointer"
                        onClick={() => handleRowClick(notebook)}
                      >
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-2 py-2">{notebook.brand}</td>
                        <td className="px-2 py-2">{notebook.model}</td>
                        <td className="px-10 py-2">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`ลบข้อมูลของ ${notebook.model}`);
                              handleDelete(notebook.barcode_id);
                            }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* เพิ่มปุ่มลิ้งไปที่หน้า Allnotebook */}
              <div className="flex justify-center mt-6">
                <Link
                  to="/admin/Allnotebook"
                  className="bg-blue text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                >
                  ดูข้อมูลทั้งหมด
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default Notebooklist;
