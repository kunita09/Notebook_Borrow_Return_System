import React, { useState, useEffect } from 'react';
import Nav from './Nav';
import Slidebar from './Sidebar';
import Swal from 'sweetalert2'; // Import SweetAlert2

function Form() {
    const [stu_fname, setFirstName] = useState('');
    const [stu_lname, setLastName] = useState('');
    const [stu_id, setStustuid] = useState('');
    const [faculty_name, setStufaculty] = useState('');
    const [formData, setFormData] = useState({
        stu_phone: '',
        witness: '',
        witness_phone: '',
    });
    const [file, setFile] = useState(null);

    const fetchStudentData = async () => {
        const stuEmail = localStorage.getItem('stu_email'); 
        console.log('Fetching data for student email:', stuEmail); 
    
        if (!stuEmail) {
            console.error('No student email found in localStorage');
            return; 
        }
    
        try {
            const response = await fetch(`http://localhost:5002/borrowStuData?stu_email=${stuEmail}`);
            const data = await response.json();
            
            if (response.ok && data.length > 0) {
                setFirstName(data[0].stu_fname);
                setLastName(data[0].stu_lname);
                setStustuid(data[0].stu_id);
                setStufaculty(data[0].faculty_name);
            } else {
                console.error('Error fetching student data:', data);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    };
    useEffect(() => {
        fetchStudentData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handlePhoneNumberChange = (e) => {
        const input = e.target.value;
        if (/^0\d{0,10}$/.test(input)) {
            setFormData((prevData) => ({
                ...prevData,
                stu_phone: input,
            }));
        }
    };

    const handleWitnessPhoneNumberChange = (e) => {
        const input = e.target.value;
        if (/^0\d{0,10}$/.test(input)) {
            setFormData((prevData) => ({
                ...prevData,
                witness_phone: input,
            }));
        }
    };

    // ฟังก์ชันจัดการการอัปโหลดไฟล์
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const stuEmail = localStorage.getItem('stu_email');
        
        if (!stuEmail) {
            console.error('No student email found in localStorage');
            return; 
        }
    
        const formDataToSend = new FormData();
        formDataToSend.append('document', file);
        formDataToSend.append('stu_email', stuEmail); 
        formDataToSend.append('stu_phone', formData.stu_phone);
        formDataToSend.append('witness', formData.witness);
        formDataToSend.append('witness_phone', formData.witness_phone);
    
        try {
            const response = await fetch(`http://localhost:5002/borrow`, {
                method: 'POST',
                body: formDataToSend,
                headers: {
                    'Accept': 'application/json' // แจ้งว่าเราต้องการ JSON กลับมา
                }
            });

            const data = await response.json(); // รับ response เป็น JSON

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: data.message || 'ส่งคำร้องสำเร็จ', // ใช้ message จาก server หรือข้อความ default
                    confirmButtonText: 'ตกลง'
                    
                }).then(() => {                   
                    window.location.href = data.redirectUrl;  // ใช้ redirect จากเซิร์ฟเวอร์
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: data.message || 'เกิดข้อผิดพลาดในการส่งคำร้อง', // ใช้ message จาก server หรือข้อความ default
                    confirmButtonText: 'ตกลง'
                });
                console.error('Error submitting form:', data);
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'เกิดข้อผิดพลาด : ระบบยังไม่เปิดรับคำร้อง',
                confirmButtonText: 'ตกลง'
            });
        }
    };
    
    return (
        <div className="flex bg-LightGray flex-col min-h-screen">
            <Nav />
            <div className="flex flex-1">
                <Slidebar />
                <div className="flex-1 p-12">
                    <div className="flex justify-center items-start mt-5">
                        <div className="w-full max-w-5xl">
                            <h1 className="text-3xl mb-6 text-center font-sans text-blue2">ส่งคำร้องขอยืมโน้ตบุ๊ก</h1>
                            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
                                <h2 className="text-xl font-sans mb-4">ข้อมูลส่วนตัว</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="Name">
                                                ชื่อ - นามสกุล :
                                            </label>
                                            <input
                                                id="Name"
                                                type="text"
                                                placeholder="กรอกชื่อจริง"
                                                value={`${stu_fname} ${stu_lname}`} // แสดงชื่อจริงและนามสกุลที่ได้จาก state
                                                readOnly
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="Faculty">
                                                หน่วยงาน / สำนักวิชา :
                                            </label>
                                            <input
                                                id="Faculty"
                                                type="text"
                                                value={faculty_name} // แสดงหน่วยงาน
                                                readOnly
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="StudentID">
                                                รหัสนักศึกษา :
                                            </label>
                                            <input
                                                id="StudentID"
                                                type="text"
                                                name="stu_id"
                                                placeholder="กรอกรหัส"
                                                value={stu_id} // แสดงรหัสนักศึกษา
                                                readOnly
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>

                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="phoneNumber">
                                                เบอร์โทรศัพท์ (ผู้ยื่น) :
                                            </label>
                                            <input
                                                id="phoneNumber"
                                                type="text"
                                                name="stu_phone"
                                                placeholder="เบอร์โทร"
                                                value={formData.stu_phone}
                                                onChange={handlePhoneNumberChange}
                                                maxLength="10"
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="h-4 border-t-2 border-gray-300 mt-6"></div>

                                    {/* ข้อมูลพยาน */}
                                    <h2 className="text-xl font-sans mb-4">ข้อมูลพยาน</h2>
                                    <div className="flex space-x-4 mb-4">
                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="WitnessID">
                                                รหัสนักศึกษาพยาน :
                                            </label>
                                            <input
                                                id="WitnessID"
                                                type="text"
                                                name="witness"
                                                placeholder="กรอกรหัส"
                                                value={formData.witness}
                                                onChange={handleChange}
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>

                                        <div className="w-1/2">
                                            <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhoneNumber">
                                                เบอร์โทรศัพท์ (พยาน) :
                                            </label>
                                            <input
                                                id="witnessPhoneNumber"
                                                type="text"
                                                placeholder="เบอร์โทรพยาน"
                                                value={formData.witness_phone}
                                                onChange={handleWitnessPhoneNumberChange}
                                                maxLength="10"
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="h-4 border-t-2 border-gray-300 mt-6"></div>

                                    {/* ช่องสำหรับอัปโหลดไฟล์ */}
                                    <div className="mb-4">
                                        <div className="flex flex-col items-start">
                                            <h2 className="text-xl font-sans mb-1">อัปโหลดเอกสารที่เกี่ยวข้อง</h2>
                                            <h3 className="text-red-700 font-sans" style={{ fontSize: '12px', marginBottom: '1rem' }}>
                                                ใบชำระค่าธรรมเนียมการศึกษา, ใบชำระค่าธรรมเนียมการศึกษาด้วย กยศ., ใบผ่อนผันการศึกษา เลือกส่งเอกสารอย่างใดอย่างหนึ่ง (สามารถอัปโหลดไฟล์ .pdf)
                                            </h3>
                                            <input type="file" accept=".pdf, .jpg, .jpeg, .png" onChange={handleFileChange} />
                                        </div>
                                    </div>

                                    {/* <button
                                        type="submit"
                                        className="bg-KKU text-white font-sans px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300"
                                    >
                                        ส่งคำร้อง
                                    </button> */}

                                    <div className="flex justify-end mt-7">
                                        <button type="submit" className="bg-blue2 from-green-400 to-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
                                            ส่งคำร้องขอยืม
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

export default Form;
