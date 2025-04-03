import React, { useState, useEffect } from 'react';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';

import { Link, useParams } from 'react-router-dom';

function DetailsReturn() {
    const { borrowId } = useParams(); // รับ borrowId จาก URL params
    const [borrowData, setBorrowData] = useState(null); // เก็บข้อมูลคำร้อง
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
   


    useEffect(() => {
        console.log("borrowId from useParams:", borrowId); // เช็คค่าของ borrowId
        const fetchBorrowData = async () => {
            try {
                const response = await fetch(`http://10.198.200.35:5002/ApproveRequestDT?borrow_id=${borrowId}`);
                const data = await response.json();
                console.log('API response:', data); // ตรวจสอบข้อมูลที่ได้จาก API

                if (response.ok && data) {
                    setBorrowData(data);  // เข้าถึงข้อมูลใน array
                    setError('');
                } else {
                    setError(data.error || 'ไม่พบข้อมูลคำร้อง');
                }
            } catch (err) {
                setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBorrowData();
    }, [borrowId]);


    // เช็คค่าของ borrowData
    useEffect(() => {
        console.log('borrowData:', borrowData);
    }, [borrowData]);

    const formatDateTime = (isoString) => {
        if (!isoString) return "-";
        
        const dateObj = new Date(isoString);
        const yearBE = dateObj.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
        const datePart = dateObj.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        });
      
        const timePart = dateObj.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      
        return `${datePart.replace(/\d{4}$/, yearBE)} ${timePart}`;
      };
      

    if (isLoading) {
        return <p>กำลังโหลดข้อมูล...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!borrowData) {
        return <p>ไม่พบข้อมูลคำร้อง</p>;
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'ยืมสำเร็จ':
                return 'text-green-600';
            case 'รอตรวจสอบ':
                return 'text-yellow-600';
            case 'คืนสำเร็จ':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const handleViewDocument = (documentUrl) => {
        if (!documentUrl) {
            console.warn('Document URL is empty');
            return;
        }
        setPdfDocument(documentUrl); // เก็บ URL ของไฟล์ PDF
    };

    return (
        <div className="flex bg-LightGray flex-col min-h-screen">
            <Navadmin />
            <div className="flex flex-1">
                <Sideberadmin />
                <div className="flex-1 p-12">
                    <div className="flex justify-center items-start mt-10">

                        <div className="w-full max-w-5xl">
                            <h1 className="text-3xl mb-6 text-center font-sans text-blue">รายละเอียดขอยืม</h1>
                            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
                                <form >

                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold">ข้อมูลผู้ยืม</h2>
                                        <span className="text-gray-700 font-sans text-sm ml-auto mr-6">
                                            สถานะ :{' '}
                                            <span className={getStatusColor(borrowData.status)}>
                                                {borrowData.status || '-'}
                                            </span>
                                        </span>
                                        <span className="text-gray-700 font-sans text-sm ">ลำดับคิว : {borrowData.borrow_id || '-'}</span>
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="fullName">
                                                ชื่อ - นามสกุล :
                                            </label>
                                            <input
                                                id="fullName"
                                                type="text"
                                                value={`${borrowData.borrower_fname || ''} ${borrowData.borrower_lname || ''}`}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="studentId">
                                                หมายเลขบัตรประจำตัวประชาชน :
                                            </label>
                                            <input
                                                id="studentId"
                                                type="text"
                                                placeholder="กรอกรหัสนักศึกษา"
                                                value={borrowData.borrower_idcard}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="studentId">
                                                รหัสนักศึกษา :
                                            </label>
                                            <input
                                                id="studentId"
                                                type="text"
                                                placeholder="กรอกรหัสนักศึกษา"
                                                value={borrowData.borrower_id}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        

                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="faculty">
                                                อีเมล (Gmail) :
                                            </label>
                                            <input
                                                id="faculty"
                                                type="text"
                                                placeholder="กรอกหน่วยงาน / สำนักวิชา"
                                                value={borrowData.borrower_email}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="faculty">
                                                หน่วยงาน / สำนักวิชา :
                                            </label>
                                            <input
                                                id="faculty"
                                                type="text"
                                                placeholder="กรอกหน่วยงาน / สำนักวิชา"
                                                value={borrowData.borrower_facultyname}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/4">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="phoneNumber">
                                                ระดับการศึกษา :
                                            </label>
                                            <input
                                                id="facult_eng"
                                                type="text"
                                                placeholder="กรอกระดับการศึกษา"
                                                value={borrowData.borrower_collegeyears}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="phoneNumber">
                                                เบอร์โทรศัพท์ (ผู้ยื่น) :
                                            </label>
                                            <input
                                                id="phoneNumber"
                                                type="text"
                                                placeholder="กรอกเบอร์โทรศัพท์"
                                                value={borrowData.borrower_phone}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="pt-7 px-4 text-center" >
                                            {borrowData.document ? (
                                                <a
                                                    href={`http://10.198.200.35:5002${borrowData.document}`}   // เชื่อมโยงไปยัง document_path
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
                                        </div>

            
                                    </div>

                                    <h2 className="text-xl font-bold mb-4">ข้อมูลพยาน</h2>
                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessName">
                                                ชื่อ - นามสกุลพยาน :
                                            </label>
                                            <input
                                                id="witnessName"
                                                type="text"
                                                placeholder="กรอกชื่อ - นามสกุลพยาน"
                                                value={`${borrowData.witness_fname} ${borrowData.witness_lname}`}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessId">
                                                หมายเลขบัตรประจำตัวประชาชนพยาน :
                                            </label>
                                            <input
                                                id="witnessId"
                                                type="text"
                                                placeholder="กรอกรหัสนักศึกษาพยาน"
                                                value={borrowData.witness_idcard}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessId">
                                                รหัสนักศึกษาพยาน :
                                            </label>
                                            <input
                                                id="witnessId"
                                                type="text"
                                                placeholder="กรอกรหัสนักศึกษาพยาน"
                                                value={borrowData.witness_id}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/4">
                                        <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessFaculty">
                                            อีเมล (Gmail) :
                                        </label>
                                        <input
                                            id="witnessFaculty"
                                            type="text"
                                            placeholder="กรอกหน่วยงาน / สำนักวิชาพยาน"
                                            value={borrowData.witness_email}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                        </div>
                                        <div className="w-1/4">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessFaculty">
                                                หน่วยงาน / สำนักวิชาพยาน :
                                            </label>
                                            <input
                                                id="witnessFaculty"
                                                type="text"
                                                placeholder="กรอกหน่วยงาน / สำนักวิชาพยาน"
                                                value={borrowData.witness_facultyname}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/4">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="phoneNumber">
                                                ระดับการศึกษา :
                                            </label>
                                            <input
                                                id="facult_eng"
                                                type="text"
                                                placeholder="กรอกระดับการศึกษา"
                                                value={borrowData.witness_collegeyears}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/4">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                                                เบอร์โทรศัพท์ (พยาน) :
                                            </label>
                                            <input
                                                id="witnessPhone"
                                                type="text"
                                                placeholder="กรอกเบอร์โทรศัพท์พยาน"
                                                value={borrowData.witness_phone}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                readOnly
                                            />
                                        </div>
                                    </div>




                                    <h2 className="text-xl font-bold mb-4">ข้อมูลการยืม</h2>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                                                วันที่ยืม :
                                            </label>
                                            <input
                                                id="borrowDate"
                                                type="text"
                                                placeholder=""
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={borrowData.borrow_date ? formatDateTime(borrowData.borrow_date) : '-'}
                                                readOnly
                                                />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                                                วันที่คืน :
                                            </label>
                                            <input
                                                id="witnessPhone"
                                                type="text"
                                                placeholder=""
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={borrowData.return_date ? formatDateTime(borrowData.return_date) : '-'}
                                                readOnly
                                            />
                                        </div>
                                        {/* <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                                                วันต่ออายุ :
                                            </label>
                                            <input
                                                id="witnessPhone"
                                                type="text"
                                                placeholder="กรอกเบอร์โทรศัพท์พยาน"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={borrowData.renew_date ? formatDateTime(borrowData.renew_date) : '-'}
                                                readOnly
                                            />
                                        </div> */}
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        {/* <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="status">
                                                สถานะ :
                                            </label>
                                            <input
                                                id="status"
                                                type="text"
                                                placeholder="กรอกสถานะ"
                                                className={`w-full p-2 border rounded-md text-center 
                                                        ${borrowData.status === "ใช้งานได้"
                                                        ? "bg-green-100 text-green-700 border-green-500"
                                                        : borrowData.status === "รอตรวจสอบ"
                                                            ? "bg-yellow-100 text-yellow-700 border-yellow-500"
                                                            : borrowData.status === "กำลังใช้งาน"
                                                                ? "bg-blue-100 text-blue-700 border-blue-500"
                                                                : "bg-red-100 text-red-700 border-red-500"
                                                    }`}
                                                value={borrowData.status}
                                                readOnly
                                            />
                                        </div> */}


                                    </div>

                                    <h2 className="text-xl font-bold mb-4">ข้อมูลเครื่องโน้ตบุ๊ก</h2>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="tagNumber">
                                                เลขแถ็ก :
                                            </label>
                                            <input
                                                id="tagNumber"
                                                type="text"
                                                placeholder="กรอกเลขแถ็ก"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={borrowData.laptop_tag}
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="barcode">
                                                บาร์โค้ด :
                                            </label>
                                            <input
                                                id="barcode"
                                                type="text"
                                                placeholder="กรอกบาร์โค้ด"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={borrowData.barcode_id}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="deviceName">
                                                ชื่อเครื่อง :
                                            </label>
                                            <input
                                                id="deviceName"
                                                type="text"
                                                placeholder="กรอกชื่อเครื่อง"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={borrowData.laptop_brand}
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="model">
                                                รุ่น :
                                            </label>
                                            <input
                                                id="model"
                                                type="text"
                                                placeholder="กรอกรุ่น"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={borrowData.laptop_model}
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="warranty">
                                                processor :
                                            </label>
                                            <input
                                                id="warranty"
                                                type="text"
                                                placeholder="กรอกประกัน"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={borrowData.laptop_cpu}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    {/* ปุ่มกลับเพิ่มเติมด้านล่าง */}
                                    <div className="flex justify-end mt-4">
                                        <Link
                                            to="/admin/notebookreturn" // ปรับเส้นทางตามความเหมาะสม
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            กลับ
                                        </Link>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default DetailsReturn;