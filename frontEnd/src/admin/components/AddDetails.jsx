import React, { useState } from 'react';
import Navadmin from './Navadmin';
import Slidebaradmin from './Sideberadmin';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2

function AddDetails() {
    const [formData, setFormData] = useState({
        insurance_date: '',
        warranty_expiry_date: '',
        file: null, // To store the selected file
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({
                ...formData,
                [name]: files[0], // Store the uploaded file
            });
        } else {
            setFormData({
                ...formData,
                [name]: value, // Update other form fields
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('insurance_date', formData.insurance_date);
        formDataToSend.append('warranty_expiry_date', formData.warranty_expiry_date);

        if (formData.file) {
            formDataToSend.append('file', formData.file); // Attach the uploaded file
        } else {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณาเลือกไฟล์ที่ต้องการอัพโหลด',
                icon: 'warning',
                confirmButtonText: 'ตกลง',
            });
            return;
        }

        try {
            const response = await axios.post('http://localhost:5002/laptopUpload', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: `เพิ่มข้อมูลโน้ตบุ๊กจำนวน ${response.data} เครื่องสำเร็จ`,
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                });
                setFormData({
                    insurance_date: '',
                    warranty_expiry_date: '',
                    file: null,
                }); // Reset form
            }
        } catch (error) {
            console.error('Error uploading data:', error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: error.response?.data || 'ไม่สามารถบันทึกข้อมูลได้',
                icon: 'error',
                confirmButtonText: 'ลองใหม่',
            });
        }
    };

    return (
        <div className="flex bg-LightGray flex-col min-h-screen">
            <Navadmin />
            <div className="flex flex-1">
                <Slidebaradmin />
                <div className="flex-1 p-12">
                    <div className="flex justify-center items-start mt-5">
                        <div className="w-full max-w-5xl">
                            <h1 className="text-3xl mb-6 text-center font-sans text-blue mt-10">เพิ่มข้อมูลเครื่องโน๊ตบุ๊ค</h1>

                            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
                                <form onSubmit={handleSubmit}>
                                    <h2 className="text-xl font-sans mb-4">ข้อมูลเครื่องโน๊ตบุ๊ค</h2>

                                    <div className="h-4 border-t-2 border-gray-300 mt-6"></div>

                                    {/* File Upload */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="file">
                                            อัพโหลดไฟล์ (Upload File) :
                                        </label>
                                        <input
                                            id="file"
                                            name="file"
                                            type="file"
                                            accept=".xlsx, .xls" // Restrict file type to Excel files
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="insurance_date">
                                                วันเริ่มประกัน (Insurance Start Date) :
                                            </label>
                                            <input
                                                id="insurance_date"
                                                name="insurance_date"
                                                type="date"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.insurance_date}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="warranty_expiry_date">
                                                วันสิ้นสุดประกัน (Warranty Expiry Date) :
                                            </label>
                                            <input
                                                id="warranty_expiry_date"
                                                name="warranty_expiry_date"
                                                type="date"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.warranty_expiry_date}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-7">
                                        <button
                                            type="submit"
                                            className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                                        >
                                            บันทึกข้อมูล
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

export default AddDetails;
