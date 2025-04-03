import React, { useEffect, useState } from 'react';
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import { Link, useParams } from 'react-router-dom';


function DetailsReqadmin() {
  const { borrowId } = useParams(); // รับ borrowId จาก URL params
  const [borrowData, setBorrowData] = useState(null); // เก็บข้อมูลคำร้อง
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!borrowId) {
          setError('ไม่พบ borrow_id ใน URL');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://10.198.200.35:5002/ApproveRequestDT?borrow_id=${borrowId}`);
        const data = await response.json();

        if (response.ok && data) {
          setBorrowData(data);
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

    fetchStudentData();
  }, [borrowId]);
  if (isLoading) {
    return <p>กำลังโหลดข้อมูล...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!borrowData) {
    return <p>ไม่พบข้อมูลคำร้อง</p>;
  }


  // ฟังก์ชันแปลงวันที่ให้อยู่ในรูปแบบที่ต้องการ
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
      case 'อนุมัติ':
        return 'text-green-600';
      case 'รอตรวจสอบ':
        return 'text-yellow-600';
      case 'ถูกปฏิเสธ':
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
                        value={borrowData.borrower_idcard || ''}
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
                    <div className="w-1/3">
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

                  {/* ปุ่มกลับเพิ่มเติมด้านล่าง */}
                  <div className="flex justify-end mt-4">
                    <Link
                      to="/admin/Home" // ปรับเส้นทางตามความเหมาะสม
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

export default DetailsReqadmin;

// function DetailsReqadmin() {
//   const { borrowId } = useParams();
//   const [borrowData, setBorrowData] = useState(null);
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchStudentData = async () => {
//       try {
//         if (!borrowId) {
//           setError('ไม่พบ borrow_id ใน URL');
//           setIsLoading(false);
//           return;
//         }

//         const response = await fetch(`http://localhost:3000/ApproveRequestDT?borrow_id=${borrowId}`);
//         const data = await response.json();

//         if (response.ok && data) {
//           setBorrowData(data);
//           setError('');
//         } else {
//           setError(data.error || 'ไม่พบข้อมูลคำร้อง');
//         }
//       } catch (err) {
//         setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
//         console.error('Error fetching data:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchStudentData();
//   }, [borrowId]);

//   if (isLoading) {
//     return <p>กำลังโหลดข้อมูล...</p>;
//   }

//   if (error) {
//     return <p>{error}</p>;
//   }

//   if (!borrowData) {
//     return <p>ไม่พบข้อมูลคำร้อง</p>;
//   }

//   return (
//     <div>
//       <h1>รายละเอียดขอยืม</h1>
//       <p>รหัสคำร้อง: {borrowData.borrow_id}</p>
//       <p>ชื่อผู้ยืม: {borrowData.borrower_fname} {borrowData.borrower_lname}</p>
//       {/* Render ข้อมูลเพิ่มเติม */}
//     </div>
//   );
// }
