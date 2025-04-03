import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios"; // ใช้ axios เพื่อทำคำขอ API
import Sideberadmin from './Sideberadmin';
import Navadmin from './Navadmin';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

function Detailsborrowing() {
  const { borrowId } = useParams();
  const [borrowData, setBorrowData] = useState({});
  const [selectedAction, setSelectedAction] = useState("return");
  const [laptopStatus, setLaptopStatus] = useState("ใช้งานได้");
  const [note, setNote] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // ป้องกันการกดซ้ำ
  const officerEmail = localStorage.getItem('officer_email');

  useEffect(() => {
    if (!officerEmail) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบ",
        text: "ไม่พบข้อมูลเจ้าหน้าที่ในระบบ",
        confirmButtonText: "ตกลง",
      }).then(() => {
        navigate("/login");
      });
    }
  }, [officerEmail, navigate]);

  useEffect(() => {
    console.log("borrowId from useParams:", borrowId);
    const fetchBorrowData = async () => {
      try {
        const response = await fetch(`http://10.198.200.35:5002/ApproveRequestDT?borrow_id=${borrowId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API response:', data);

        if (data) {
          setBorrowData(data);
          setError('');
        } else {
          setError('ไม่พบข้อมูลคำร้อง');
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

  useEffect(() => {
    console.log('borrowData:', borrowData);
  }, [borrowData]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    const postData = {
      borrow_id: borrowData.borrow_id,
      action: selectedAction,
      laptop_status: ["return", "renew", "repair"].includes(selectedAction) ? laptopStatus : null,
      note,
      officer_email: officerEmail,
    };

    try {
      const response = await axios.post("http://10.198.200.35:5002/borrowDT", postData);

      if (response.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: response.data.message,
          confirmButtonText: "ตกลง",
        }).then(() => {
          navigate(-1);
        });
      } else {
        throw new Error(response.data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error saving borrow data", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      "ยืมสำเร็จ": "text-green-600",
      "รอตรวจสอบ": "text-yellow-600",
      "คืนสำเร็จ": "text-red-600",
      "ซ่อมบำรุง": "text-blue-600",
      "ยกเลิก": "text-gray-400",
    };
    return statusColors[status] || "text-gray-600";
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
                    <div>
                      <td className="pt-7 px-2 text-center">
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
                      </td>
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
                    <div className="w-1/3">
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
                        ระดับการศึกษาพยาน :
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

                  <h2 className="text-xl font-bold mb-4">ข้อมูลเครื่องโน้ตบุ๊ก</h2>
                  <div className="flex space-x-4 mb-4">
                    <div className="w-full">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="tagNumber">
                        เลขแถ็ก :
                      </label>
                      <input
                        id="tagNumber"
                        type="text"
                        placeholder="กรอกเลขแถ็ก"
                        value={borrowData.laptop_tag || 'ไม่มีข้อมูล'}  // ถ้าไม่มีข้อมูลจะแสดงข้อความนี้
                        className="w-full p-2 border border-gray-300 rounded-md"
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
                        value={borrowData.barcode_id || 'ไม่มีข้อมูล'}  // ถ้าไม่มีข้อมูลจะแสดงข้อความนี้
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-4">การดำเนินการ</h2>

                  <div className="flex space-x-6 mb-4">
                    {/* คืนเครื่อง */}
                    <div className="w-full">
                      <label htmlFor="return" className="text-gray-700 font-sans text-sm flex items-center">
                        <input
                          type="radio"
                          id="return"
                          name="action"
                          value="return"
                          checked={selectedAction === "return"}
                          onChange={() => setSelectedAction("return")}
                          className="mr-2"
                        />
                        <span>คืนเครื่อง</span>
                      </label>
                    </div>

                    {/* ต่ออายุการยืม */}
                    <div className="w-full">
                      <label htmlFor="renew" className="text-gray-700 font-sans text-sm flex items-center">
                        <input
                          type="radio"
                          id="renew"
                          name="action"
                          value="renew"
                          checked={selectedAction === "renew"}
                          onChange={() => setSelectedAction("renew")}
                          className="mr-2"
                        />
                        <span>ต่ออายุการยืม</span>
                      </label>
                    </div>

                    {/* ซ่อม */}
                    <div className="w-full">
                      <label htmlFor="repair" className="text-gray-700 font-sans text-sm flex items-center">
                        <input
                          type="radio"
                          id="repair"
                          name="action"
                          value="repair"
                          checked={selectedAction === "repair"}
                          onChange={() => setSelectedAction("repair")}
                          className="mr-2"
                        />
                        <span>ซ่อม</span>
                      </label>
                    </div>
                  </div>

                  {/* ช่องหมายเหตุ */}
                  <div className="flex-1">
                    <label htmlFor="note" className="block text-gray-700 font-sans text-sm mb-2">
                      หมายเหตุ:
                    </label>
                    <textarea
                      id="note"
                      placeholder="กรอกหมายเหตุ"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md resize-y overflow-auto"
                    />
                  </div>

                  {/* ปุ่มกด */}
                  <div className="flex justify-end mt-4 space-x-6">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      บันทึก
                    </button>
                    <Link
                      to="/admin/notebookborrowing"
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
      </div>
    </div>
  );
}

export default Detailsborrowing;
