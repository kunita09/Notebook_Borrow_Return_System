import React, { useState, useEffect }  from 'react';
import { Link,useLocation,useNavigate } from 'react-router-dom';
import Navadmin from './Navadmin';
import Slidebaradmin from './Sideberadmin';
import { format } from 'date-fns'; // ใช้สำหรับจัดรูปแบบวันที่

function NotebookDetail() {
    const navigate = useNavigate(); // เรียก useNavigate ที่นี่
    const location = useLocation(); // ดึงข้อมูลจาก location
    const { brand, model } = location.state || {}; // รับค่าแบรนด์และรุ่น

    console.log('Received brand and model:', brand, model); // Debug log

    const [notebookDetails, setNotebookDetails] = useState(null);

    useEffect(() => {
        if (brand && model) {
        fetchNotebookDetails(brand, model);
        }
    }, [brand, model]);

    const fetchNotebookDetails = async (brand, model) => {
        try {
        const response = await fetch(`http://localhost:5002/notebookdetail?brand=${brand}&model=${model}`);
        const data = await response.json();

        if (response.ok) {
            setNotebookDetails(data); // เก็บข้อมูลโน๊ตบุ๊คใน state
        } else {
            console.error('Error fetching notebook details:', data);
        }
        } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        }
    };

    if (!notebookDetails) {
        return <div>Loading...</div>;
    }
    // const handleViewAllNotebooks = (brand, model) => {
    //     navigate('/admin/Allnotebook', {
    //       state: { brand, model }, // ส่ง brand และ model ไป
    //     });
    //   };

    const displayDate = (date) => date ? format(new Date(date), 'dd/MM/yyyy') : '-';

    return (
        <div className="flex bg-LightGray flex-col min-h-screen">
            <Navadmin />
            <div className="flex flex-1">
                <Slidebaradmin />
                <div className="flex-1 p-12">
                    <div className="flex justify-center items-start mt-5">
                        <div className="w-full max-w-5xl">
                            <h1 className="text-3xl mt-4 mb-6 text-center font-sans text-blue">รายละเอียดโน้ตบุ๊ก</h1>
                                                   
                    
                            {/* กรอบสำหรับแสดงข้อมูล */}
                            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
                                {/* ข้อมูลเครื่องโน๊ตบุ๊ค */}




                                {/* แถวที่ 2: brand และ model */}
                                <div className="flex space-x-4 mb-4">
                                    <div className="w-1/2">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">ยี่ห้อโน๊ตบุ๊ค (Brand) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.brand}</p>
                                    </div>

                                    <div className="w-1/2">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">รุ่นโน๊ตบุ๊ค (Model) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.model}</p>
                                    </div>
                                </div>

                                {/* แถวที่ 3: serial_number, processor, ram_size */}
                                <div className="flex space-x-4 mb-4">
                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">หมายเลขซีเรียล (Serial Number) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.serial_number}</p>
                                    </div>

                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">ซีพียู (Processor) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.processor}</p>
                                    </div>

                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">แรม (RAM Size) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.ram_size}</p>
                                    </div>
                                </div>

                                {/* แถวที่ 4: storage_size, storage_type, gpu */}
                                <div className="flex space-x-4 mb-4">
                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">การจัดเก็บข้อมูล (Storage Size) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.storage_size}</p>
                                    </div>

                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">ประเภทของหน่วยความจำ (Storage Type) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.storage_type}</p>
                                    </div>

                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">การ์ดจอ (GPU) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.gpu}</p>
                                    </div>
                                </div>

                                {/* แถวที่ 5: display_size, os, price */}
                                <div className="flex space-x-4 mb-4">
                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">ขนาดหน้าจอ (Display Size) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.display_size}</p>
                                    </div>

                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">ระบบปฏิบัติการ (OS) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.os}</p>
                                    </div>

                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">ราคา (Price) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.price}</p>
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">จำนวน (Number) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{notebookDetails.number}</p>
                                    </div>
                                </div>

                                {/* แถวที่ 6: insurance_date และ warranty_expiry_date */}
                                <div className="flex space-x-4 mb-4">
                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">วันที่ประกัน (Insurance Date) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{displayDate(notebookDetails.insurance_date)}</p>
                                    </div>

                                    <div className="w-1/3">
                                        <label className="block text-gray-700 font-sans text-sm mb-2">วันหมดประกัน (Warranty Expiry Date) :</label>
                                        <p className="p-2 border border-gray-300 rounded-md bg-gray-100">{displayDate(notebookDetails.warranty_expiry_date)}</p>
                                    </div>


                                </div>


                                {/* ปุ่มกลับไปยังรายการโน๊ตบุ๊ค */}
                                <div className="flex justify-end mt-4 space-x-4">
                                    {/* <button
                                        onClick={() => handleViewAllNotebooks(brand, model)}
                                        className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-green-700 transition duration-200 ease-in-out"
                                    >
                                        ดูรายการเครื่องทั้งหมด
                                    </button> */}
                                    {/* <Link
                                        to="/admin/Allnotebook"
                                        className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-green-700 transition duration-200 ease-in-out">
                                        ดูรายการเครื่องทั้งหมด
                                    </Link> */}
                                    <Link
                                        to="/admin/Notebooklist"
                                        className="bg-blue text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition duration-200 ease-in-out">
                                        กลับ
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotebookDetail;
