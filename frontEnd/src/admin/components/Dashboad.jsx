import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Navadmin from './Navadmin';
import Sideberadmin from './Sideberadmin';
import Dashboadtotal from './Dashboadtotal';
import DashboadChart from './DashboadChart';
import DashboadFilemonth from './DashboadFilemonth';
import Dashboadlist from './Dashboadlist';

function Dashboad() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const reportRef = useRef(null);

  return (
    <div className="flex flex-col min-h-screen bg-LightGray">
      <Navadmin />
      <div className="flex flex-1">
        <Sideberadmin />
        <div className="flex-1 flex flex-col p-4 mt-[80px]">
          <div className="flex-1 flex flex-col">
            <h1 className="text-3xl mb-6 font-sans text-blue">สรุปข้อมูล</h1>

            <div className="flex justify-between items-start">

              {/* ✅ ส่วนที่ต้องการบันทึกเป็น PDF */}
              <div ref={reportRef} className="flex-1 bg-white p-4 rounded-lg shadow-md">
                <Dashboadtotal />
                {/* ✅ ทำให้ DashboardChart เลื่อนได้เฉพาะตัวมันเอง */}
                <div className="mt-[20px] overflow-x-auto">
                  <DashboadChart />
                </div>
              </div>

              {/* ✅ ส่วนที่แสดงไฟล์ที่สามารถดาวน์โหลด */}
              <div className="ml-4">
                <DashboadFilemonth reportRef={reportRef} />
              </div>

            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-2 p-4 mt-[-45px]">
            <Dashboadlist />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboad;
