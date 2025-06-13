import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

function Addofficer() {
    // สร้าง state สำหรับเก็บค่าจากฟอร์ม
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        position: '',
        phone: '',
        email: '',
        password: '',
    });

    // ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงข้อมูลในฟอร์ม
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // ฟังก์ชันจัดการเมื่อมีการส่งฟอร์ม
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('http://localhost:5002/insertOfficer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    officer_fname: formData.firstName,
                    officer_lname: formData.lastName,
                    officer_email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    job_position: formData.position,
                }),
            });
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'เพิ่มข้อมูลเจ้าหน้าที่สำเร็จ',
                    confirmButtonText: 'ตกลง'
                }).then((result) => { // เพิ่ม argument result
                    if (result.isConfirmed) { // ตรวจสอบว่าผู้ใช้กดปุ่มตกลงจริง
                        window.location.href = '/admin/OfficerList';
                    }
                    setFormData({ // เคลียร์ฟอร์ม
                        firstName: '',
                        lastName: '',
                        position: '',
                        phone: '',
                        email: '',
                        password: '',
                    });
                });
            } else {
                const error = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: `เกิดข้อผิดพลาด: ${error}`,
                    confirmButtonText: 'ตกลง'
                });
            }
        } catch (error) {
            console.error('Error adding officer:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล',
                confirmButtonText: 'ตกลง'
            });
        }
    };

    return (
        <div className="flex bg-LightGray flex-col min-h-screen">
            <Navadmin />
            <div className="flex flex-1">
                <Sideberadmin />
                <div className="flex-1 p-12">
                    <div className="flex justify-center items-start mt-5">
                        <div className="w-full max-w-5xl">
                            <h1 className="text-3xl mb-6 text-center font-sans text-blue mt-10">เพิ่มข้อมูลเจ้าหน้าที่</h1>
                            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
                                <h2 className="text-xl font-sans mb-4">ข้อมูลส่วนตัว</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="firstName">
                                                ชื่อ :
                                            </label>
                                            <input
                                                id="firstName"
                                                type="text"
                                                name="firstName"
                                                placeholder="กรอกชื่อ"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="lastName">
                                                นามสกุล :
                                            </label>
                                            <input
                                                id="lastName"
                                                type="text"
                                                name="lastName"
                                                placeholder="กรอกนามสกุล"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="position">
                                                ตำแหน่ง :
                                            </label>
                                            <input
                                                id="position"
                                                type="text"
                                                name="position"
                                                placeholder="กรอกตำแหน่ง"
                                                value={formData.position}
                                                onChange={handleChange}
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="phone">
                                                เบอร์โทรศัพท์ :
                                            </label>
                                            <input
                                                id="phone"
                                                type="text"
                                                name="phone"
                                                placeholder="กรอกเบอร์โทร"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="email">
                                                อีเมล :
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                placeholder="กรอกอีเมล"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="password">
                                                รหัสผ่าน :
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                name="password"
                                                placeholder="กรอกรหัสผ่าน"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-7">
                                        <button
                                            type="submit"
                                            className="bg-blue2 from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                                        >
                                            บันทึก
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Addofficer;
