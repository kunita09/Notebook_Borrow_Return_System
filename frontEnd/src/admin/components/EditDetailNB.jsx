import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navadmin from './Navadmin';
import Slidebaradmin from './Sideberadmin';
import axios from 'axios';
import Swal from 'sweetalert2';


function EditDetailNB() {
    const { laptopTag } = useParams(); // ดึง laptopTag จาก URL
    const [formData, setFormData] = useState({
        laptop_tag: '',
        brand: '',
        model: '',
        serial_number: '',
        cpu: '',
        ram: '',
        storage: '',
        storage_type: '',
        gpu: '',
        display: '',
        os: '',
        insurance_date: '',
        warranty_expiry_date: '',
        price: '',
        number: '',
        status: ''
    });
    const [originalData, setOriginalData] = useState(null); // เก็บข้อมูลต้นฉบับ
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (laptopTag) {
            fetch(`http://10.198.200.35:5002/dataEditSN?laptop_tag=${laptopTag}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    const formattedData = {
                        laptop_tag: data.laptop_tag || '',
                        brand: data.brand || '',
                        model: data.model || '',
                        serial_number: data.serial_number || '',
                        cpu: data.cpu || '',
                        ram: data.ram || '',
                        storage_type: data.storage_type || '',
                        storage: data.storage || '',
                        gpu: data.gpu || '',
                        display: data.display || '',
                        os: data.os || '',
                        insurance_date: data.insurance_date ? formatDate(data.insurance_date) : '',
                        warranty_expiry_date: data.warranty_expiry_date ? formatDate(data.warranty_expiry_date) : '',
                        price: data.price || '',
                        number: data.number || '',
                        status: data.status || ''
                    };

                    setFormData(formattedData);
                    setOriginalData(formattedData); // อัปเดตค่า originalData ด้วยข้อมูลต้นฉบับ
                })
                .catch((error) => {
                    console.error('Error fetching laptop data:', error);
                });
        }
    }, [laptopTag]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        setIsEditing(true); // ตั้งค่าให้รู้ว่ากำลังแก้ไข
    };

    const handleSave = async (e) => {
        e.preventDefault();
    
        if (!isEditing || !originalData) return;
    
        const updatedData = {};
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== originalData[key] && formData[key] !== "") {
                updatedData[key] = formData[key];
            }
        });
    
        if (Object.keys(updatedData).length === 0) {
            Swal.fire({
                icon: "info",
                title: "ไม่มีการเปลี่ยนแปลง",
                text: "กรุณาแก้ไขข้อมูลก่อนบันทึก",
                confirmButtonText: "ตกลง",
            });
            return;
        }
    
        // 🔥 แจ้งเตือนให้ผู้ใช้ยืนยันก่อนแก้ไข
        const result = await Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "ข้อมูลที่แก้ไขจะถูกบันทึก!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ใช่, บันทึกเลย!",
            cancelButtonText: "ยกเลิก",
        });
    
        if (!result.isConfirmed) return;
    
        updatedData.laptop_tag = laptopTag; // ต้องมี laptop_tag เสมอ
    
        axios
            .post(`http://10.198.200.35:5002/editDetailNB`, updatedData)
            .then((response) => {
                console.log("Laptop details updated:", response.data);
    
                Swal.fire({
                    icon: "success",
                    title: "บันทึกสำเร็จ!",
                    text: "ข้อมูลได้รับการอัปเดตแล้ว",
                    confirmButtonText: "ตกลง",
                });
    
                setOriginalData(formData); // อัปเดต originalData ให้ตรงกับค่าล่าสุด
                setIsEditing(false);
                
            })
            .catch((error) => {
                console.error("Error saving data:", error);
    
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถบันทึกข้อมูลได้",
                    confirmButtonText: "ตกลง",
                });
            });
            window.history.back(); // กลับไปหน้าหลักหลังจากบันทึก
    };
    
    const toggleEditMode = () => {
        setIsEditing((prev) => !prev);
    };

    // ฟังก์ชัน formatDate ที่แปลงวันที่เป็นรูปแบบ YYYY-MM-DD
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // เดือนต้อง +1 และเติม 0 หากมี 1 หลัก
        const day = String(d.getDate()).padStart(2, '0'); // เติม 0 หากมี 1 หลัก
        return `${day}-${month}-${year}`;
    };

    
      

    return (
        <div className="flex bg-LightGray flex-col min-h-screen">
            <Navadmin />
            <div className="flex flex-1">
                <Slidebaradmin />
                <div className="flex-1 p-12">
                    <div className="flex justify-center items-start mt-5">
                        <div className="w-full max-w-5xl">
                            <h1 className="text-3xl mb-6 text-center font-sans text-blue mt-10">ข้อมูลเครื่องโน้ตบุ๊ก (หมายเลขเครื่องโน้ตบุ๊ก)</h1>

                            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
                                <form onSubmit={handleSave}>
                                    <h2 className="text-xl font-sans mb-4">ข้อมูลเครื่องโน๊ตบุ๊ค</h2>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="brand">
                                                หมายเลขเครื่อง (Laptop Tag) :
                                            </label>
                                            <input
                                                id="brand"
                                                name="brand"
                                                type="text"
                                                placeholder="กรอกยี่ห้อโน๊ตบุ๊ค"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                readOnly
                                                value={formData.laptop_tag}
                                                onChange={handleChange}
                                                disabled={!isEditing} // ทำให้ไม่สามารถแก้ไขได้เมื่อไม่อยู่ในโหมดแก้ไข
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="brand">
                                                สถานที่ตั้ง :
                                            </label>
                                            <input
                                                id="brand"
                                                name="brand"
                                                type="text"
                                                placeholder="กรอกยี่ห้อโน๊ตบุ๊ค"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                readOnly
                                                value={formData.brand}
                                                onChange={handleChange}
                                                disabled={!isEditing} // ทำให้ไม่สามารถแก้ไขได้เมื่อไม่อยู่ในโหมดแก้ไข
                                            />
                                        </div>

                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="model">
                                                รุ่นโน๊ตบุ๊ค (Model) :
                                            </label>
                                            <input
                                                id="model"
                                                name="model"
                                                type="text"
                                                placeholder="กรอกรุ่นโน๊ตบุ๊ค"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.model}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="serial">
                                                หมายเลขซีเรียล (Serial Number) :
                                            </label>
                                            <input
                                                id="serial_number"
                                                name="serial_number"
                                                type="text"
                                                placeholder="กรอกหมายเลขซีเรียล"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.serial_number}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="cpu">
                                                ซีพียู (cpu) :
                                            </label>
                                            <input
                                                id="cpu"
                                                name="cpu"
                                                type="text"
                                                placeholder="กรอกซีพียู (cpu)"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.cpu}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="ram">
                                                แรม (RAM Size) :
                                            </label>
                                            <input
                                                id="ram"
                                                name="ram"
                                                type="text"
                                                placeholder="กรอกข้อมูล RAM Size"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.ram}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    {/* แถวที่ 4: storage_size, storage_type, gpu */}
                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="storage">
                                                การจัดเก็บข้อมูล (Storage) :
                                            </label>
                                            <input
                                                id="storage"
                                                name="storage"
                                                type="text"
                                                placeholder="กรอกข้อมูล Storage "
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.storage}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        {/* <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="storage_type">
                                                ประเภทของหน่วยความจำ (Storage Type) :
                                            </label>
                                            <input
                                                id="storage_type"
                                                name="storage_type"
                                                type="text"
                                                placeholder="กรอกข้อมูล Storage Type"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.storage_type}
                                                onChange={handleChange}
                                            />
                                        </div> */}

                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="gpu">
                                                การ์ดจอ (GPU) :
                                            </label>
                                            <input
                                                id="gpu"
                                                name="gpu"
                                                type="text"
                                                placeholder="กรอกข้อมูล GPU"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.gpu}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="w-1/4">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="display">
                                                ขนาดหน้าจอ (Display Size) :
                                            </label>
                                            <input
                                                id="display"
                                                name="display"
                                                type="text"
                                                placeholder="กรอกขนาดหน้าจอ"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.display}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="os">
                                                ระบบปฏิบัติการ (OS) :
                                            </label>
                                            <input
                                                id="os"
                                                name="os"
                                                type="text"
                                                placeholder="กรอกข้อมูล ระบบปฏิบัติการ"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={formData.os}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    {/* แถวที่ 5: display_size, os, price */}
                                    <div className="flex space-x-4 mb-4">
                                        

                                        {/* <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="price">
                                                ราคา (Price) :
                                            </label>
                                            <input
                                                id="price"
                                                name="price"
                                                type="number"
                                                placeholder="กรอกราคา"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                readOnly
                                                value={formData.price}
                                                onChange={handleChange}
                                            />
                                        </div> */}
                                    </div>

                                    {/* เส้นกันสีเทา */}
                                    <div className="h-4 border-t-2 border-gray-300 mt-6"></div>

                                    {/* ช่องประกัน */}
                                    {/* <div className="flex space-x-4 mb-4"> */}
                                    {/* วันเริ่มประกัน */}
                                    {/* <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="insurance_date">
                                                วันเริ่มประกัน (Insurance Start Date) :
                                            </label>
                                            <input
                                                id="insurance_date"
                                                name="insurance_date"
                                                type="date"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                readOnly                                                
                                                value={formData.insurance_date}
                                                onChange={handleChange}
                                            />
                                        </div> */}

                                    {/* วันสิ้นสุดประกัน */}
                                    {/* <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="warranty_expiry_date">
                                                วันสิ้นสุดประกัน (Warranty Expiry Date) :
                                            </label>
                                            <input
                                                id="warranty_expiry_date"
                                                name="warranty_expiry_date"
                                                type="date"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                readOnly
                                                value={formData.warranty_expiry_date}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div> */}

                                    <div className="flex justify-end space-x-4">
                                        {/* ปุ่มลบ */}
                                        {/* <button
                                            type="button"
                                            onClick={handleDelete} // ฟังก์ชันที่เรียกใช้เมื่อคลิกปุ่มลบ
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                        >
                                            ลบข้อมูล
                                        </button> */}
                                        {/* ปุ่มแก้ไข */}
                                        <button
                                            type="submit"
                                            disabled={!isEditing}
                                            className={`${
                                                isEditing ? 'bg-blue3 hover:bg-blue3' : 'bg-blue3-300 cursor-not-allowed'
                                            } text-white px-4 py-2 rounded-lg`}
                                        >
                                            บันทึกข้อมูล
                                        </button>

                                        <button
                                            type="button"
                                            onClick={toggleEditMode} // เปลี่ยนโหมดระหว่างแก้ไขและดูข้อมูล
                                            className={`${isEditing ? 'bg-yellow-300' : 'bg-yellow-400'
                                                } text-black px-4 py-2 rounded-lg hover:bg-yellow-500`}
                                        >
                                            {isEditing ? 'ยกเลิกการแก้ไข' : 'แก้ไขข้อมูล'}
                                        </button>
                                        
                                        {/* <button
                                            type="button"
                                            onClick={handleDelete}
                                            // disabled={!isEditing}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                        >
                                            ลบข้อมูล
                                        </button> */}

                                        {/* ปุ่มย้อนกลับ */}
                                        <button
                                            type="button"
                                            onClick={() => window.history.back()}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            ย้อนกลับ
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

export default EditDetailNB;
