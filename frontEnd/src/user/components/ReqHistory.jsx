import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import Slidebar from './Sidebar';
import Nav from './Nav';
import { format } from 'date-fns'; // ใช้สำหรับจัดรูปแบบวันที่

function ReqHistory() {
    const [borrowHistory, setBorrowHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfDocument, setPdfDocument] = useState(null);
    const navigate = useNavigate();
    
    const stuEmail = localStorage.getItem('stu_email') || ''; // 🔹 ป้องกัน null

    useEffect(() => {
        if (!stuEmail) {
            console.warn('No student email found in localStorage');
            setIsLoading(false);
            return;
        }

        const fetchBorrowHistory = async () => {
            try {5002
                const response = await fetch(`http://localhost:5002/reqHistory?stu_email=${stuEmail}`);
                if (!response.ok) throw new Error('Failed to fetch data');
                
                const data = await response.json();
                console.log('📌 Borrow History:', data); // ✅ Debug Data
                
                setBorrowHistory(data);
            } catch (error) {
                console.error('Error fetching borrow history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBorrowHistory();
    }, [stuEmail]); // ✅ ใช้ stuEmail เป็น dependency

    const displayValue = (value) => (value ? value : '-');
    const displayDate = (date) => date ? format(new Date(date), 'dd/MM/yyyy') : '-';

    const getStatusColor = (status) => {
        switch (status) {
            case 'อนุมัติ': return 'text-green-600';
            case 'รอตรวจสอบ': return 'text-yellow-600';
            case 'ถูกปฏิเสธ': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const handleViewDocument = (documentUrl) => {
        if (!documentUrl) {
            console.warn('Document URL is empty');
            return;
        }
        setPdfDocument(documentUrl);
    };

    const handleRowClick = (borrow_id) => {
        if (!borrow_id) {
            console.warn('No borrow_id found');
            return;
        }
        console.log(`Navigating to /detailsReq/${borrow_id}`);
        navigate(`/DetailsReq/${borrow_id}`);
    };
    

 
    return (
        <div className="flex bg-LightGray flex-col min-h-screen font-sans">
            <Nav />
            <div className="flex flex-1">
                <Slidebar />
                <div className="flex-1 p-12 overflow-x-auto">
                    <h1 className="text-3xl mt-12 mb-6 text-center font-sans text-blue2">ประวัติการยืม</h1>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
                            <thead className="bg-blue2 text-white">
                                <tr>
                                    <th className="py-3 px-4 text-center">ลำดับคิว</th>
                                    <th className="py-3 px-4 text-center">วันที่ส่งคำร้องขอยืม</th>
                                    <th className="py-3 px-4 text-center">วันที่ยืม</th>
                                    <th className="py-3 px-4 text-center">วันที่คืน</th>
                                    <th className="py-3 px-4 text-center">พยาน</th>
                                    <th className="py-3 px-4 text-center">เอกสาร</th>
                                    <th className="py-3 px-4 text-center">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">กำลังโหลด...</td>
                                    </tr>
                                ) : borrowHistory.length > 0 ? (
                                    borrowHistory.map((borrow) => (
                                        <tr
                                            key={borrow.borrow_id}
                                            className="border-b hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleRowClick(borrow.borrow_id)}  // ตรวจสอบว่า borrow.borrow_id ถูกต้อง
                                        >
                                            <td className="py-3 px-4 text-center">{borrow.borrow_id}</td>
                                            <td className="py-3 px-4 text-center">{displayDate(borrow.request_date)}</td>
                                            <td className="py-3 px-4 text-center">{displayDate(borrow.borrow_date)}</td>
                                            <td className="py-3 px-4 text-center">{displayDate(borrow.return_date)}</td>
                                            <td className="py-3 px-4 pl-20">
                                                {displayValue(borrow.witness_fname)} {displayValue(borrow.witness_lname)}
                                                <br />
                                                {displayValue(borrow.witness_email)}<br />
                                                โทร: {displayValue(borrow.witness_phone)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {borrow.document ? (
                                                    <a
                                                        href={`http://localhost:5002${borrow.document}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline"
                                                        onClick={(event) => {
                                                            event.stopPropagation(); // ป้องกันไม่ให้คลิกส่งต่อไปยัง handleRowClick
                                                        }}
                                                    >
                                                        <i className="fa fa-file-pdf text-red-600" style={{ fontSize: '2rem' }}></i>
                                                    </a>
                                                ) : (
                                                    'ตรวจสอบเอกสาร'
                                                )}
                                            </td>
                                            <td className={`py-3 px-4 text-center ${getStatusColor(borrow.status)}`}>
                                                {displayValue(borrow.status)}
                                            </td>
                                        </tr>

                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">ไม่มีประวัติการยืม</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReqHistory;
