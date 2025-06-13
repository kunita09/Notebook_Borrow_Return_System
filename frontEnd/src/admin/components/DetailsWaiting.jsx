
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import { Link, useParams, useNavigate } from 'react-router-dom';

function DetailsWaiting() {
    const { borrowId } = useParams(); // รับ borrowId จาก URL params
    const [borrowData, setBorrowData] = useState(null); // เก็บข้อมูลคำร้อง
    const [error, setError] = useState(''); // ข้อความข้อผิดพลาด
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('ยืมสำเร็จ'); // ค่า status ที่จะส่ง
    const [laptopTag, setLaptopTag] = useState(''); // ฟิลด์สำหรับ laptop_tag
    const [laptopData, setLaptopData] = useState(null); // ข้อมูล laptop ที่จะดึงมาแสดง
    const [message, setMessage] = useState(null); // ข้อความแสดงความสำเร็จ
    const [successMessage, setSuccessMessage] = useState(''); // ข้อความแจ้งเตือนเมื่อบันทึกสำเร็จ
    const navigate = useNavigate(); // ใช้ useNavigate
    const officerEmail = localStorage.getItem('officer_email');  // ดึง email จาก localStorage

    if (!officerEmail) {
        console.error('Officer email not found in localStorage');
        return;
    }

    // ดึงข้อมูลคำร้อง
    useEffect(() => {
        const fetchBorrowData = async () => {
            if (!borrowId) {
                setError('ไม่พบ borrow_id ใน URL');
                setIsLoading(false);
                return;
            }

            setIsLoading(true); // เริ่มการโหลด
            try {
                const response = await axios.get(`http://localhost:5002/ApproveRequestDT?borrow_id=${borrowId}`);
                setBorrowData(response.data);
                setError('');
            } catch (err) {
                setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
                console.error('Error fetching borrow data:', err);
            } finally {
                setIsLoading(false); // ตั้งเป็น false หลังจากดึงข้อมูลเสร็จ
            }
        };

        fetchBorrowData();
    }, [borrowId]);

    // ฟังก์ชันดึงข้อมูล Laptop ตาม laptop_tag
    const fetchLaptopData = async (tag) => {
        try {
            const response = await fetch(`http://localhost:5002/laptop`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ laptop_tag: tag }),
            });

            if (!response.ok) {
                throw new Error('Error fetching laptop data');
            }

            const data = await response.json();
            setLaptopData(data); // อัปเดตข้อมูล laptop ที่ได้
        } catch (err) {
            console.error('Error fetching laptop data:', err.message);
        }
    };

    // ฟังก์ชันจัดการการเปลี่ยนแปลงใน input laptop_tag
    const handleLaptopTagChange = (e) => {
        const tag = e.target.value;
        setLaptopTag(tag);
        if (tag.length === 9) {
            fetchLaptopData(tag); // ดึงข้อมูลเมื่อ tag ครบ 9 ตัวอักษร
        } else {
            setLaptopData(null); // รีเซ็ตข้อมูล laptop ถ้า tag ไม่ครบ
        }
    };

    // ฟังก์ชันบันทึกข้อมูล
    const handleSave = async (e) => {
        e.preventDefault();

        if (!laptopTag) {
            setError('กรุณาระบุ laptop tag');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5002/waitingDT?borrowId=${borrowId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    laptop_tag: laptopTag,
                    status: status,  // สถานะที่ต้องการอัปเดต
                    officer_email: officerEmail, // ส่ง officer_email
                }),
            });

            if (!response.ok) {
                throw new Error('เกิดข้อผิดพลาด: ' + (await response.text()));
            }

            const data = await response.json();
            setSuccessMessage('บันทึกสำเร็จ'); // ตั้งข้อความแจ้งเตือนสำเร็จ
            setError('');
            setMessage(data.message || 'บันทึกสำเร็จ');
            setLaptopData({
                ...laptopData,
                status: data.laptop_status,  // กำหนดค่าของ status จากข้อมูลที่ได้รับจากเซิร์ฟเวอร์
            });

            // ถ้าบันทึกสำเร็จให้ย้อนกลับไปที่หน้าก่อนหน้า
            setTimeout(() => {
                window.history.back();  // ใช้แทน navigate(-1)
            }, 1000);

        } catch (err) {
            setMessage(null);
            setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <p>กำลังโหลดข้อมูล...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!borrowData) return <p>ไม่พบข้อมูลคำร้อง</p>;

    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            })
            : '-';

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
                                <form onSubmit={handleSave}>
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
                                                    href={`http://localhost:5002${borrowData.document}`}   // เชื่อมโยงไปยัง document_path
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
                                        {/* <div className="w-1/3">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="document">
                        เอกสาร :
                      </label>

                    </div> */}
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
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessFaculty">
                                                อีเมลพยาน :
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
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessFaculty">
                                                หน่วยงาน / สำนักวิชาพยาน :
                                            </label>
                                            <input
                                                id="witnessFaculty"
                                                type="text"
                                                placeholder="กรอกหน่วยงาน / สำนักวิชาพยาน"
                                                value={borrowData.witness_facultyname}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                required
                                            />
                                        </div>
                                        <div className="w-1/3">
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
                                        <div className="w-1/3">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                                                เบอร์โทรศัพท์ (พยาน) :
                                            </label>
                                            <input
                                                id="witnessPhone"
                                                type="text"
                                                placeholder="กรอกเบอร์โทรศัพท์พยาน"
                                                value={borrowData.witness_phone}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold mb-2">ข้อมูลอุปกรณ์ที่ขอยืม</h2>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="laptopTag">
                                            รหัส Laptop:
                                        </label>
                                        <input
                                            type="text"
                                            value={laptopTag || ''}
                                            onChange={handleLaptopTagChange} // เพิ่ม handler นี้
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        {laptopData && (
                                            <>
                                                <div className="w-1/4">
                                                    <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="laptopModel">
                                                        ชื่อรุ่น (Model) :
                                                    </label>
                                                    <input
                                                        id="laptopModel"
                                                        type="text"
                                                        placeholder="กรอกชื่อรุ่น"
                                                        value={laptopData.model || ''}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                        required
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="w-1/4">
                                                    <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="laptopBrand">
                                                        ยี่ห้อ (Brand) :
                                                    </label>
                                                    <input
                                                        id="laptopBrand"
                                                        type="text"
                                                        placeholder="กรอกรายละเอียด"
                                                        value={laptopData.brand || ''}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                        required
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="w-1/4">
                                                    <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="laptopBrand">
                                                        หมายเลข Barcode :
                                                    </label>
                                                    <input
                                                        id="laptopBrand"
                                                        type="text"
                                                        placeholder="กรอกบาร์โค้ด"
                                                        value={laptopData.barcode_id}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                        required
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="w-1/4">
                                                    <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="laptopStatus">
                                                        สถานะ (Status) :
                                                    </label>
                                                    <div
                                                        id="laptopStatus"
                                                        className={`w-full p-2 border rounded-md text-center 
                                                            ${laptopData.status === "ใช้งานได้"
                                                                ? "bg-green-100 text-green-700 border-green-500"
                                                                : laptopData.status === "รอตรวจสอบ"
                                                                    ? "bg-yellow-100 text-yellow-700 border-yellow-500"
                                                                    : laptopData.status === "กำลังใช้งาน"
                                                                        ? "bg-blue-100 text-blue-700 border-blue-500"
                                                                        : "bg-red-100 text-red-700 border-red-500"
                                                            }`}
                                                    >
                                                        {laptopData.status}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="submit"
                                            className="bg-blue2 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                        >
                                            บันทึกข้อมูล
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => window.history.back()}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            ย้อนกลับ
                                        </button>
                                    </div>
                                </form>
                                {successMessage && (
                                    <div className="mt-4 text-green-500 font-semibold">
                                        {successMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailsWaiting;
