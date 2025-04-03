import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import axios from 'axios';

function Dashboardlist() {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // เพิ่ม useState สำหรับ searchTerm
    const [filteredOfficers, setFilteredOfficers] = useState([]);  // สำหรับค้นหา

    // State สำหรับจัดการหน้า (Pagination)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;  // จำนวนรายการที่แสดงต่อหน้า

    // ดึงข้อมูลจาก API เมื่อ component โหลด
    useEffect(() => {
        axios.get('http://10.198.200.35:5002/manageByAdmin') // URL ของ API
            .then((response) => {
                setOfficers(response.data);  // ตั้งค่า officers จากข้อมูล API
                setFilteredOfficers(response.data); // กำหนดค่าเริ่มต้นให้ filteredOfficers
                setLoading(false); // อัปเดตสถานะการโหลด
            })
            .catch((error) => {
                console.error('Error fetching officer data:', error);
                setError(error); // ตั้งค่า error ใน state
                setLoading(false); // อัปเดตสถานะการโหลด
            });
    }, []);


    // ฟังก์ชันค้นหา
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filteredData = officers.filter((officer) => {
            return (
                officer.stu_id.toLowerCase().includes(term) ||
                `${officer.officer_borrow_fname} ${officer.officer_borrow_lname} ${officer.officer_return_fname} ${officer.officer_return_lname} 
                ${officer.borrow_status} ${officer.faculty_engName}`.toLowerCase().includes(term) || `${officer.stu_fname} ${officer.stu_fname}`.toLowerCase().includes(term)
            );
        });

        setFilteredOfficers(filteredData);
        setCurrentPage(1); // รีเซ็ตไปหน้าแรกเมื่อค้นหา
    };

    // คำนวณค่าตามหน้าปัจจุบัน
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOfficers.slice(indexOfFirstItem, indexOfLastItem);

    // ฟังก์ชันเปลี่ยนหน้า
    const nextPage = () => {
        if (currentPage < Math.ceil(filteredOfficers.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (loading) return <div>กำลังโหลดข้อมูล...</div>;
    if (error) return <div>เกิดข้อผิดพลาด: {error.message}</div>;

     // คำนวณลำดับเริ่มต้นของรายการในหน้าปัจจุบัน
     const startNumber = (currentPage - 1) * itemsPerPage + 1;

    return (
        <div className="flex-1 p-12">
            <div className="flex flex-col items-center">
                <div className="w-full max-w-70xl bg-white shadow-lg rounded-lg p-8">
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="text-3xl text-center font-sans text-blue">รายชื่อผู้ที่ถูกทำรายการ</h1>
                    </div>

                    <div className="flex justify-center mb-4">
                        <input
                            type="text"
                            placeholder="ค้นหา ..."
                            className="w-96 px-4 py-2 border border-gray-300 rounded-lg"
                            onChange={handleSearch}
                            value={searchTerm}
                        />
                    </div>

                    <div className="overflow-x-auto rounded-lg shadow-sm">
                        <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
                            <thead>
                                <tr className="bg-blue text-white">
                                    <th className="px-4 py-2 text-center font-semibold">ลำดับ</th>
                                    <th className="px-4 py-2 text-center font-semibold">รหัสนักศึกษา</th>
                                    <th className="px-2 py-2 text-center font-semibold">ชื่อ-นามสกุล</th>
                                    <th className="px-2 py-2 text-center font-semibold">คณะ</th>
                                    <th className="px-2 py-2 text-center font-semibold">หมายเลขเครื่อง</th>
                                    <th className="px-2 py-2 text-center font-semibold">สถานะ</th>
                                    <th className="px-2 py-2 text-center font-semibold">ผู้ทำรายการยืม</th>
                                    <th className="px-4 py-2 text-center font-semibold">ผู้รับเรื่อง</th>
                                    {/* <th className="px-4 py-2 text-center font-semibold">ลบ</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((officer, index) => (
                                    <tr
                                        key={officer.borrow_id}
                                        className="border-b hover:bg-gray-50 transition duration-200 cursor-pointer"
                                    >
                                        <td className="px-4 py-2 text-center">{officer.borrow_id}</td> 
                                        <td className="px-4 py-2 text-center ">{officer.stu_id}</td>
                                        <td className="px-2 py-2 text-center ">{`${officer.stu_fname} ${officer.stu_lname}`}</td>
                                        <td className="px-2 py-2 text-center ">{officer.faculty_engName}</td>
                                        <td className="px-2 py-2 text-center ">{officer.laptop_tag}</td>
                                        <td className="px-2 py-2 text-center ">{officer.borrow_status}</td>
                                        <td className="px-2 py-2 text-center ">{`${officer.officer_borrow_fname} ${officer.officer_borrow_lname}` || '-'}</td>
                                        <td className="px-2 py-2 text-center ">{`${officer.officer_return_fname} ${officer.officer_return_lname}` || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* ปุ่มเปลี่ยนหน้า */}
                    <div className="flex justify-center mt-4 space-x-4">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue text-white hover:bg-blue-700'}`}
                        >
                            ย้อนกลับ
                        </button>
                        <span className="px-4 py-2">หน้า {currentPage} / {Math.ceil(filteredOfficers.length / itemsPerPage)}</span>
                        <button
                            onClick={nextPage}
                            disabled={currentPage >= Math.ceil(filteredOfficers.length / itemsPerPage)}
                            className={`px-4 py-2 rounded ${currentPage >= Math.ceil(filteredOfficers.length / itemsPerPage) ? 'bg-gray-300' : 'bg-blue text-white hover:bg-blue-700'}`}
                        >
                            ถัดไป
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboardlist;