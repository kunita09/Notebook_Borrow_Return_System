import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPen, faCalendar, faChevronDown, faChartSimple } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


function Dashboadtotal() {
    const [total, setTotal] = useState(0); // เก็บค่าทั้งหมด
    const [remaining, setRemaining] = useState(0); // เก็บค่า remaining
    const [reserve, setReserve] = useState(0); // เก็บค่าเครื่องสำรอง
    const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
    const [facultyCount, setFacultyCount] = useState(0); // เก็บค่าจำนวนคณะ

    useEffect(() => {
        axios.get('http://localhost:5002/report') // ใช้ URL ของ API ที่คุณต้องการดึงข้อมูล
            .then((response) => {
                setTotal(response.data.total); // ตั้งค่า total
                setRemaining(response.data.remaining); // ตั้งค่า remaining
                setReserve(response.data.reserve); // ตั้งค่า remaining
                setLoading(false); // โหลดข้อมูลเสร็จ
                setFacultyCount(response.data.facultyCount); // ตั้งค่าจำนวนคณะ
            })
            .catch((error) => {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            });
    }, []); // [] หมายความว่าใช้ effect นี้แค่ครั้งเดียวเมื่อ component ถูก mount

    if (loading) {
        return <div>กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className='flex gap-4 w-full font-sans rounded-lg shadow-lg'>
            <BoxWrapper>
                <div className='pl-4'>
                    <div className='flex items-center'>
                        <i className="fa-solid fa-laptop text-xl text-gray-700 mr-2"></i>
                        <strong className='text-xl text-gray-700 font-semibold'>{total} เครื่อง</strong>
                    </div>
                    <span className='text-sm text-gray-700 font-light'> จำนวนโน้ตบุ๊กที่ถูกยืมไป </span>
                </div>
            </BoxWrapper>

            <BoxWrapper>
                <div className='pl-4'>
                    <div className='flex items-center'>
                        <i className="fa-solid fa-laptop text-xl text-gray-700 mr-2"></i>
                        <strong className='text-xl text-gray-700 font-semibold'>{remaining} เครื่อง</strong>
                    </div>
                    <span className='text-sm text-gray-700 font-light'> จำนวนโน้ตบุ๊กที่เหลือ </span>
                </div>
            </BoxWrapper>      

            <BoxWrapper>
                <div className='pl-4'>
                    <div className='flex items-center'>
                        <i className="fa-solid fa-laptop text-xl text-gray-700 mr-2"></i>
                        <strong className='text-xl text-gray-700 font-semibold'>{reserve} เครื่อง</strong>
                    </div>
                    <span className='text-sm text-gray-700 font-light'> จำนวนโน้ตบุ๊กสำรอง </span>
                </div>
            </BoxWrapper>
            
            <BoxWrapper>
                <div className='pl-4'>
                    <div className='flex items-center'>
                        <i className="fa-solid fa-laptop text-xl text-gray-700 mr-2"></i>
                        <strong className='text-xl text-gray-700 font-semibold'>{facultyCount} คณะ</strong>
                    </div>
                    <span className='text-sm text-gray-700 font-light'> จำนวนคณะที่ยืม </span>
                </div>
            </BoxWrapper>
        </div>
    );
}

function BoxWrapper({ children }) {
    return <div className='bg-white rounded-sm p-4 h-38 flex-1 border border-gray-200 flex '>{children}</div>;
}

export default Dashboadtotal;



// function BoxWrapper({ children }) {
//     return <div className='bg-white rounded-sm p-4 h-38 flex-1 border border-gray-200 flex '>{children}</div>
// }