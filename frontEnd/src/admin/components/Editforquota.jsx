import React, { useState, useEffect } from 'react';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

import { FaTrash, FaEdit } from "react-icons/fa";


function Editforquota() {

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState([]);
    const [departmentEng, setDepartmentEng] = useState('');
    const [departmentThai, setDepartmentThai] = useState('');
    const [count, setCount] = useState('');
    const [controlStart, setControlStart] = useState('');
    const [controlEnd, setControlEnd] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // ดึงข้อมูลคณะทั้งหมดและช่วงเวลาเปิดฟอร์ม
        fetchFaculties();
        fetchControlRequest();
    }, []);

    const fetchControlRequest = async () => {
        try {
            const response = await fetch('http://10.198.200.35:5002/settingBorrowData');
            const result = await response.json();

            if (result.length > 0) {
                const latestRequest = result[result.length - 1]; // ใช้รายการล่าสุด

                // จัดรูปแบบวันที่เป็น DD/MM/YYYY
                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    });
                };

                setControlStart(formatDate(latestRequest.start)); // ตั้งค่าช่วงเริ่มต้น
                setControlEnd(formatDate(latestRequest.end));     // ตั้งค่าช่วงสิ้นสุด
            }
        } catch (error) {
            console.error('Error fetching control request data:', error);
        }
    };

    const fetchFaculties = async () => {
        try {
            const response = await fetch('http://10.198.200.35:5002/faculties');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching faculties:', error);
        }
    };

    const handleAddClick = () => {
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://10.198.200.35:5002/insertfacultiesQuota', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ faculty_engName: departmentEng, faculty_name: departmentThai, number: count }),
            });
    
            const data = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'เพิ่มข้อมูลคณะสำเร็จ',
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    fetchFaculties();  // โหลดข้อมูลใหม่
                    setShowForm(false);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: data.error || 'ไม่สามารถเพิ่มข้อมูลได้',
                    confirmButtonText: 'ตกลง'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
                confirmButtonText: 'ตกลง'
            });
            console.error('Error:', err);
        }
    };

    const handleSaveDates = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            Swal.fire({ // แสดง SweetAlert2 กรณีที่ยังไม่ได้กรอกข้อมูล
                icon: 'warning',
                title: 'คำเตือน',
                text: 'กรุณากรอกวันเปิดและวันปิด',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        try {
            const response = await fetch('http://10.198.200.35:5002/settingBorrowData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ start: startDate, end: endDate }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({ // แสดง SweetAlert2 กรณีบันทึกสำเร็จ
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'บันทึกข้อมูลวันเปิด-ปิดสำเร็จ',
                    confirmButtonText: 'ตกลง'
                }).then(() => { // เพิ่ม .then() เพื่อให้ reload หน้าหลังจากกด OK
                    window.location.reload();
                });
            } else {
                Swal.fire({ // แสดง SweetAlert2 กรณีเกิด error จาก backend
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลวันเปิด-ปิดเนื่องจากต้องเลือกวันเปิดหลังจากวันปิดล่าสุด', // ใช้ข้อความจาก backend ถ้ามี
                    confirmButtonText: 'ตกลง'
                });
            }
        } catch (err) { // ดักจับ error กรณี fetch ล้มเหลว เช่น network error
            console.error('Error saving dates:', err);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
                confirmButtonText: 'ตกลง'
            });
        }
    };

    const handleDelete = async (id, faculty_name) => { // รับ faculty_name เพิ่มเติม
        Swal.fire({
            title: `คุณต้องการลบข้อมูลของ ${faculty_name} หรือไม่?`, // ใช้ faculty_name ในคำถาม
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบ!',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('http://10.198.200.35:5002/deleteQuota', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        Swal.fire(
                            'ลบแล้ว!',
                            data.message || `ข้อมูลของ ${faculty_name} ถูกลบเรียบร้อยแล้ว`, // ใช้ message จาก backend ถ้ามี
                            'success'
                        );
                        setData(prevData => prevData.filter(item => item.id !== id)); // Update state อย่างถูกต้อง
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: data.error || 'เกิดข้อผิดพลาดในการลบข้อมูล' // ใช้ error message จาก backend ถ้ามี
                        });
                    }
                } catch (error) {
                    console.error('Error deleting data:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
                    });
                }
            }
        });
    };


    return (
        <div className="flex flex-col min-h-screen bg-LightGray">
            <Navadmin />
            <div className="flex flex-1">
                <Sideberadmin />
                <div className="flex-1 p-12">
                    <div className="flex flex-col items-center mt-12">
                        <div className="w-full max-w-7xl bg-white shadow-lg rounded-lg p-8">
                            <div className="flex items-center justify-between mb-1">
                                <h1 className="text-3xl mb-6 text-center font-sans text-blue">จัดการข้อมูล วันเปิด-ปิด</h1>
                            </div>
                            <form onSubmit={handleSaveDates}>
                                <div className="flex space-x-4 ">
                                    <div className="w-1/2">
                                        {/* วันเปิด */}
                                        <div className="flex flex-col">
                                            <label className="text-lg font-medium text-gray-700 mb-2">วันเปิด</label>
                                            <input
                                                type="date"
                                                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-1/2">
                                        <div className="flex flex-col">
                                            <label className="text-lg font-medium text-gray-700 mb-2">วันปิด</label>
                                            <input
                                                type="date"
                                                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>


                                </div>

                                <div className="flex items-center justify-between mb-2 mt-4">
                                    <h3 className="text-xl mb-2 text-center font-sans text-red">
                                        ช่วงเวลาเปิดฟอร์มยื่นขอยืมโน้ตบุ๊กล่าสุด {controlStart} - {controlEnd}
                                    </h3>
                                </div>


                                <div className="flex justify-end mt-7">
                                    <button type="submit" className="bg-blue2 from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
                                        บันทึก
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>

                    <div className="flex flex-col items-center mt-12">
                        <div className="w-full max-w-7xl bg-white shadow-lg rounded-lg p-8">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl mb-6 text-center font-sans text-blue">
                                    จัดการข้อมูล เพิ่มจำนวนเครื่อง
                                </h1>
                                <button
                                    onClick={handleAddClick}
                                    className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                                >
                                    เพิ่ม
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-lg shadow-sm">
                                <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
                                    <thead>
                                        <tr className="bg-blue text-white">
                                            <th className="px-4 py-2 text-center font-semibold">ลำดับ</th>
                                            <th className="px-2 py-2 text-center font-semibold">หน่วยงาน / สำนักวิชา (English)</th>
                                            <th className="px-2 py-2 text-left font-semibold">หน่วยงาน / สำนักวิชา (Thai)</th>
                                            <th className="px-2 py-2 text-center font-semibold">จำนวนเครื่อง</th>
                                            <th className="px-4 py-2 text-center font-semibold">ดำเนินการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="border-b hover:bg-gray-50 transition duration-200 cursor-pointer"
                                            >
                                                <td className="px-4 py-2 text-center">{index + 1}</td>
                                                <td className="px-2 py-2 text-center">{item.faculty_engName}</td>
                                                <td className="px-2 py-2 ">{item.faculty_name}</td>
                                                <td className="px-2 py-2 text-center">{item.number}</td>
                                                <td className="px-10 py-2 flex justify-center items-center">
                                                    {/* ปุ่มแก้ไข */}
                                                    {/* <button
                                                    className="text-blue-500 hover:text-blue-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        alert(`แก้ไขข้อมูลของ ${item.department}`);
                                                    }}
                                                >
                                                    <FaEdit />
                                                </button> */}

                                                    {/* ปุ่มลบ */}
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item.id, item.faculty_name); // ส่ง faculty_name ไปด้วย
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
                        </div>

                    </div>


                    {/* ป๊อปอัพฟอร์ม */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-8 w-96">
                                <h2 className="text-xl font-semibold text-center mb-4">เพิ่มข้อมูลเครื่อง</h2>

                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                            หน่วยงาน / สำนักวิชา (English):
                                        </label>
                                        <input
                                            id="department"
                                            type="text"
                                            value={departmentEng}
                                            onChange={(e) => setDepartmentEng(e.target.value)}
                                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                            placeholder="กรุณากรอกหน่วยงาน"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                            หน่วยงาน / สำนักวิชา (Thai):
                                        </label>
                                        <input
                                            id="department"
                                            type="text"
                                            value={departmentThai}
                                            onChange={(e) => setDepartmentThai(e.target.value)}
                                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                            placeholder="กรุณากรอกหน่วยงาน"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="count" className="block text-sm font-medium text-gray-700">
                                            จำนวนเครื่อง:
                                        </label>
                                        <input
                                            id="count"
                                            type="number"
                                            value={count}
                                            onChange={(e) => setCount(e.target.value)}
                                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                            placeholder="กรุณากรอกจำนวนเครื่อง"
                                        />
                                    </div>

                                    <div className="mt-4 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                                        >
                                            ปิด
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                                        >
                                            ยืนยัน
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}


                </div>

            </div>
        </div>

    )
}

export default Editforquota