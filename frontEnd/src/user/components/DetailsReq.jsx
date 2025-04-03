import Nav from './Nav';
import Slidebar from './Sidebar';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function DetailsReq() {
  const { borrowId } = useParams(); // ดึง borrowId จาก URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://10.198.200.35:5002/detailsReq/${borrowId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("ไม่พบข้อมูลการยืม");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [borrowId]);

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // ตรวจสอบว่ามีข้อมูลหรือไม่ก่อนใช้
  const formattedRequestDate = data?.borrowInfo?.requestDate
    ? new Date(data.borrowInfo.requestDate).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    : "";

  const formattedBorrowDate = data?.borrowInfo?.borrowDate
    ? new Date(data.borrowInfo.borrowDate).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    : "";

  const formattedReturnDate = data?.borrowInfo?.returnDate
    ? new Date(data.borrowInfo.returnDate).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    : "";

  const formattedRenewDate = data?.borrowInfo?.renewDate
    ? new Date(data.borrowInfo.renewDate).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    : "";


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
      <Nav />
      <div className="flex flex-1">
        <Slidebar />
        <div className="flex-1 p-12">
          <div className="flex justify-center items-start mt-5">
            <div className="w-full max-w-5xl">
              <h1 className="text-3xl mb-6 text-center font-sans text-blue2">รายละเอียดขอยืม</h1>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
                <form >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">ข้อมูลผู้ยืม</h2>
                    <span
                      id="borrower_id"
                      className="text-gray-700 font-sans text-sm p-2  rounded-md"
                    >
                      ลำดับคิวที่ {data?.borrowId || "ไม่มีข้อมูล"}
                    </span>
                  </div>

                  <div className="flex space-x-4 mb-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="fullName">
                        ชื่อ - นามสกุล :
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="กรอกชื่อ - นามสกุล"
                        value={`${data?.borrower?.fname || ""} ${data?.borrower?.lname || ""}`}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />

                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="studentId">
                        รหัสนักศึกษา :
                      </label>
                      <input
                        id="stu_id"
                        type="text"
                        placeholder="กรอกชื่อ - นามสกุล"
                        value={data?.borrower?.id}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 mb-4">

                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="faculty">
                        หน่วยงาน / สำนักวิชา :
                      </label>
                      <input
                        id="borrow_faculty"
                        type="text"
                        placeholder="กรอกชื่อ - นามสกุล"
                        value={data?.borrower?.faculty?.name ?? "-"}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="phoneNumber">
                        เบอร์โทรศัพท์ (ผู้ยื่น) :
                      </label>
                      <input
                        id="stuphone"
                        type="text"
                        placeholder="กรอกชื่อ - นามสกุล"
                        value={data?.borrower?.phone}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                  </div>

                  <h2 className="text-xl font-bold mb-4">ข้อมูลพยาน</h2>
                  <div className="flex space-x-4 mb-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessName">
                        ชื่อ - นามสกุลพยาน :
                      </label>
                      <input
                        id="witnessName"
                        type="text"
                        value={`${data?.witness?.fname} ${data?.witness?.lname}`}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessId">
                        รหัสนักศึกษาพยาน :
                      </label>
                      <input
                        id="witnessId"
                        type="text"
                        value={data?.witness?.id}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 mb-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessFaculty">
                        หน่วยงาน / สำนักวิชาพยาน :
                      </label>
                      <input
                        id="witnessFaculty"
                        type="text"
                        value={data?.witness?.faculty?.name ?? "-"}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                        เบอร์โทรศัพท์ (พยาน) :
                      </label>
                      <input
                        id="witnessPhone"
                        type="text"
                        value={data?.witness?.phone}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                  </div>

                  <h2 className="text-xl font-bold mb-4">ข้อมูลการยืม</h2>

                  <div className="flex space-x-4 mb-4">
                    <div className="w-1/4">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                        วันที่ยื่นคำร้อง :
                      </label>
                      <input
                        id="witnessPhone"
                        type="text"
                        value={formattedRequestDate || "-"}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                    <div className="w-1/4">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                        วันที่ยืม :
                      </label>
                      <input
                        id="witnessPhone"
                        type="text"
                        value={formattedBorrowDate || "-"}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                    <div className="w-1/4">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                        วันที่คืน:
                      </label>
                      <input
                        id="witnessPhone"
                        type="text"
                        value={formattedReturnDate || "-"}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                    {/* <div className="w-1/4">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="witnessPhone">
                        วันที่ยืมต่อ:
                      </label>
                      <input
                        id="witnessPhone"
                        type="text"
                        value={formattedRenewDate || "-"}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div> */}
                    <div className="w-1/4">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="status">
                        สถานะ :
                      </label>
                      <input
                        id="status"
                        type="text"
                        value={data?.borrowInfo?.status}
                        className={`w-full p-2 border border-gray-300 rounded-md ${getStatusColor(data?.borrowInfo?.status)}`}
                        readOnly
                      />
                    </div>

                    
                  </div>


                  {/* <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="queueNumber">
                        สถาที่รับโน้ตบุ๊ก :
                      </label>
                      <input
                        id="queueNumber"
                        type="text"
                        placeholder="กรอกลำดับคิว"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>                     
                  </div>*/}


                  {/* <h2 className="text-xl font-bold mb-4">ข้อมูลโน๊ตบุ๊ก</h2>
                  <div className="flex space-x-4 mb-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="queueNumber">
                        เลขเครื่องโน้ตบุ๊ก :
                      </label>
                      <input
                        id="queueNumber"
                        type="text"
                        value={laptop_tag  || "-"}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="queueNumber">
                        ยี่ห้อโน้ตบุ๊ก :
                      </label>
                      <input
                        id="queueNumber"
                        type="text"
                        value={laptop_brand  || "-"}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                  </div> */}
                  <h2 className="text-xl font-bold mb-4">ข้อมูลเครื่องโน้ตบุ๊ก</h2>

                  <div className="flex space-x-4 mb-4">
                      <div className="w-1/3">
                          <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="tagNumber">
                              เลขแถ็ก :
                          </label>
                          <input
                              id="tagNumber"
                              type="text"
                              placeholder="กรอกเลขแถ็ก"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={data?.notebookInfo?.laptopTag}
                              readOnly
                          />
                      </div>
                      <div className="w-1/3">
                          <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="barcode">
                              บาร์โค้ด :
                          </label>
                          <input
                              id="barcode"
                              type="text"
                              placeholder="กรอกบาร์โค้ด"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={data?.notebookInfo?.barcodeId}
                              readOnly
                          />
                      </div>
                      <div className="w-1/3">
                          <label className="block text-gray-700 font-sans text-sm mb-2" htmlFor="deviceName">
                              ชื่อเครื่อง :
                          </label>
                          <input
                              id="deviceName"
                              type="text"
                              placeholder="กรอกชื่อเครื่อง"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={data?.notebookInfo?.model}
                              readOnly
                          />
                      </div>
                  </div>

                  

                  <div className="flex justify-end w-full">
                    <button
                      type="button"
                      className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none"
                      onClick={() => window.history.back()}
                    >
                      กลับ
                    </button>
                  </div>

                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailsReq