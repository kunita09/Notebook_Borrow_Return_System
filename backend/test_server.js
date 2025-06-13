
// เรียกใช้ mysql2 และ express
const mysql = require('mysql2');
const express = require('express');
const app = express();

// ใช้ dotenv เพื่อโหลดค่าจาก .env
require('dotenv').config();

// ตั้งค่าการเชื่อมต่อฐานข้อมูลจากไฟล์ .env
const db = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

// สร้างการเชื่อมต่อฐานข้อมูล MySQL
const connection = mysql.createConnection(db);

console.log(db); // ตรวจสอบค่าที่ได้

// ตรวจสอบการเชื่อมต่อ
connection.connect((err) => {
    if (err) {
        console.error('การเชื่อมต่อฐานข้อมูลล้มเหลว: ' + err.stack);
        return;
    }
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ: ' + connection.threadId);
});

// ตั้งค่าให้เซิร์ฟเวอร์ฟังที่พอร์ต 3000
app.listen(3000, function () {
    console.log('Server is listening on port 3000');
});
