import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import { FaTrash, FaEdit } from "react-icons/fa";
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

function PageOfficerlist() {
    const [officers, setOfficers] = useState([]);

    const fetchOfficers = async () => {
        try {
            const response = await fetch('http://localhost:5002/officers');
            const data = await response.json();
            setOfficers(data);
        } catch (error) {
            console.error('Error fetching officers:', error);
        }
    };

    const deleteOfficer = async (officer_id, officer_fname, officer_lname) => { // รับชื่อและนามสกุล
        Swal.fire({
            title: `คุณต้องการลบข้อมูลของ ${officer_fname} ${officer_lname} หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบ!',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('http://localhost:5002/deleteOfficer', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ officer_id }),
                    });

                    const data = await response.json();
                    if (response.ok) {
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: data.message || `ลบข้อมูลของ ${officer_fname} ${officer_lname} สำเร็จ`, // แสดงชื่อใน alert
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        fetchOfficers();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: data.error || 'เกิดข้อผิดพลาดในการลบข้อมูล',
                        });
                    }
                } catch (error) {
                    console.error('Error deleting officer:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
                    });
                }
            }
        });

    };

    useEffect(() => {
        fetchOfficers();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Navadmin />
            <div className="flex flex-1">
                <Sideberadmin />
                <div className="flex-1 p-12">
                    <div className="flex flex-col items-center mt-12">
                        <div className="w-full max-w-7xl bg-white shadow-lg rounded-lg p-8">
                            <div className="flex items-center justify-between mb-10">
                                <h1 className="text-3xl text-center font-sans text-blue">รายชื่อเจ้าหน้าที่</h1>
                                <Link
                                    to="/admin/AddOfficer"
                                    className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                                >
                                    เพิ่ม
                                </Link>
                            </div>

                            <div className="overflow-x-auto rounded-lg shadow-sm">
                                <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
                                    <thead>
                                        <tr className="bg-blue text-white">
                                            <th className="px-4 py-2 text-center font-semibold">ลำดับ</th>
                                            <th className="px-2 py-2 text-left font-semibold">ชื่อ-นามสกุล เจ้าหน้าที่</th>
                                            <th className="px-2 py-2 text-left font-semibold">ตำแหน่ง</th>
                                            <th className="px-4 py-2 text-left font-semibold">อีเมล</th>
                                            <th className="px-2 py-2 text-left font-semibold">เบอร์โทร</th>
                                            <th className="px-4 py-2 text-left font-semibold">ดำเนินการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {officers.map((officer, index) => (
                                            <tr
                                                key={officer.officer_id}
                                                className="border-b hover:bg-gray-50 transition duration-200 cursor-pointer"
                                            >
                                                <td className="px-4 py-2 text-center">{index + 1}</td>
                                                <td className="px-2 py-2">{`${officer.officer_fname} ${officer.officer_lname}`}</td>
                                                <td className="px-2 py-2">{officer.job_position}</td>
                                                <td className="px-2 py-2">{officer.officer_email }</td>
                                                <td className="px-2 py-2">{officer.phone}</td>
                                                <td className="px-10 py-2">
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteOfficer(officer.officer_id, officer.officer_fname, officer.officer_lname); // ส่งชื่อและนามสกุลไปด้วย
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
                </div>
            </div>
        </div>
    );
}

export default PageOfficerlist;