
import React, { useState } from 'react';
import Textuser from '../../user/components/Textuser';

const Testadmin = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);  // ใช้ useState สำหรับควบคุมการเปิด-ปิดฟอร์ม

  const toggleForm = () => {
    setIsFormOpen(prev => !prev);  // สลับสถานะการเปิด-ปิดฟอร์ม
  };

  return (
    <div>
      <h1>หน้าแอดมิน</h1>
      {/* ปุ่มสำหรับเปิด-ปิดฟอร์ม */}
      <button onClick={toggleForm}>
        {isFormOpen ? "ปิดฟอร์มผู้ใช้" : "เปิดฟอร์มผู้ใช้"}
      </button>

      {/* ส่ง isFormOpen ไปยัง Textuser */}
      <Textuser isFormOpen={isFormOpen} />
    </div>
  );
};

export default Testadmin;