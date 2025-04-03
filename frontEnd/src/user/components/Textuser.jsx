import React from 'react';

function Textuser({ isFormOpen }) {
  return (
    <div>
      <h1>หน้าแบบฟอร์มผู้ใช้</h1>
      {isFormOpen ? (
        <div>
          <label>ชื่อผู้ใช้:</label>
          <input type="text" placeholder="ชื่อผู้ใช้" />
          <br />
          <label>อีเมล:</label>
          <input type="email" placeholder="อีเมล" />
          <br />
          <button>ส่งข้อมูล</button>
        </div>
      ) : (
        <p>ฟอร์มถูกปิดชั่วคราว</p>
      )}
    </div>
  );
}

export default Textuser;
