const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser'); 
const mysql2 = require('mysql2/promise');  
const mysql = require('mysql');
const multer = require('multer');
const storage = multer.memoryStorage(); // ใช้ memoryStorage เพื่อให้ไฟล์ถูกเก็บใน buffer
const JsBarcode = require('jsbarcode');
const xlsx = require('xlsx');  // เพิ่มบรรทัดนี้ที่ต้นไฟล์
const { createCanvas } = require('canvas'); // ใช้สำหรับสร้าง SVG
const moment = require('moment');
const path = require('path');
const fs = require('fs');
app.use(bodyParser.json()); // สำหรับ JSON 
app.use(bodyParser.urlencoded({ extended: true })); // สำหรับ URL encoded

// สร้างโฟลเดอร์ /reports ถ้ายังไม่มี
const uploadDir = path.join(__dirname, "reports");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// สร้างโฟลเดอร์ /report_return_late ถ้ายังไม่มี
const uploadDirRelate = path.join(__dirname, "reports_return_late");
if (!fs.existsSync(uploadDirRelate)) {
  fs.mkdirSync(uploadDirRelate, { recursive: true });
}


// ตั้งค่า multer ให้บันทึกไฟล์ลงในโฟลเดอร์ /reports/
const storageReport = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // บันทึกไฟล์ในโฟลเดอร์ reports
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // ใช้ชื่อไฟล์เดิม
  },
});

const storageReLate = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirRelate); // บันทึกไฟล์ในโฟลเดอร์ reports
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // ใช้ชื่อไฟล์เดิม
  },
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(cors())
app.use(cors({
  origin: ['http://localhost:5173'], //, 'http://10.198.200.35:5173' กำหนด URL ที่อนุญาต
  methods: ['GET', 'POST' ,'PUT' , 'PATCH'],
  credentials: true
})); 

require('dotenv').config(); 
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


// let connection;

// function handleDisconnect() {
//   connection = mysql.createConnection(db);

//   connection.connect((err) => {
//     if (err) {
//       console.error('❌ Database connection failed:', err);
//       setTimeout(handleDisconnect, 2000); // ลองใหม่ทุก 2 วินาที
//     } else {
//       console.log('✅ Database connected!');
//     }
//   });

//   connection.on('error', (err) => {
//     console.error('⚠️ MySQL error', err);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//       console.log('🔄 Reconnecting to MySQL...');
//       handleDisconnect(); // รีเชื่อมต่อใหม่
//     } else {
//       throw err;
//     }
//   });
// }

// handleDisconnect();

// module.exports = connection; 

// ตรวจสอบการเชื่อมต่อ
connection.connect((err) => {
    if (err) {
        console.error('การเชื่อมต่อฐานข้อมูลล้มเหลว: ' + err.stack);
        return;
    }
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ: ' + connection.threadId);
});

app.listen(5002, "0.0.0.0", () => {
  console.log('Server is listening on port 5002')
})



// API สำหรับรับข้อมูลและบันทึกลงในฐานข้อมูล


app.post('/register', async (req, res) => {
  const { stu_no, stu_fname, stu_lname, stu_email, password, stu_id, stu_idcard, stu_faculty, college_years, stu_phone } = req.body;

  // ตรวจสอบว่าข้อมูลครบถ้วน
  if (!stu_no || !stu_fname || !stu_lname || !stu_email || !password || !stu_id || !stu_idcard || !stu_faculty || !college_years || !stu_phone) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    // ตรวจสอบว่าคณะมีอยู่ในฐานข้อมูลหรือไม่
    const facultyQuery = `SELECT id FROM faculty WHERE faculty_name = ?`;

    connection.query(facultyQuery, [stu_faculty], (err, results) => {
      if (err) {
        console.error('Error checking faculty:', err.stack);
        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบคณะ' });
      }

      // ถ้าไม่มีข้อมูลใน faculty ให้แจ้ง error และไม่บันทึกข้อมูล
      if (results.length === 0) {
        return res.status(400).json({ error: 'ไม่พบคณะนี้ในระบบ กรุณากรอกคณะที่ถูกต้อง' });
      }

      // ดึง faculty_id จากตาราง faculty
      const facultyId = results[0].id;

      // ตรวจสอบว่าค่าของ facultyId มีค่าหรือไม่
      if (!facultyId) {
        return res.status(500).json({ error: 'เกิดข้อผิดพลาด faculty_id เป็น NULL' });
      }

      // SQL Query สำหรับการบันทึกข้อมูล (stu_barcode = NULL)
      const insertQuery = `INSERT INTO studentdetail (stu_no, stu_fname, stu_lname, stu_email, password, stu_id, stu_idcard, stu_faculty, college_years, stu_phone, stu_barcode) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`;

      const values = [stu_no, stu_fname, stu_lname, stu_email, password, stu_id, stu_idcard, facultyId, college_years, stu_phone];

      connection.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Error inserting data:', err.stack);
          return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
        }
        res.status(201).json({ message: 'บันทึกข้อมูลสำเร็จ', userId: result.insertId });
      });
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});


/*####################################### Student ##############################################*/

// Endpoint Login 
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // ตรวจสอบว่าข้อมูลถูกส่งมาครบหรือไม่
  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณาระบุอีเมลและรหัสนักศึกษา' });
  }

  // ค้นหาข้อมูลในฐานข้อมูล
  const stuQuery = `SELECT * FROM studentdetail WHERE stu_email = ? AND password = ?`;
  const values = [email, password];

  connection.query(stuQuery, values, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err.message);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }

    // ถ้าพบข้อมูลใน studentdetail แสดงว่าเป็นนักศึกษา
    if (result.length > 0) {
      // ตัวอย่างการส่ง response จาก Backend
      return res.status(200).json({
        message: 'เข้าสู่ระบบสำเร็จในฐานะนักศึกษา',
        role: 'student',// เพิ่มข้อมูล role
        stu_email: email, // ส่ง stu_email กลับไป 
        redirectUrls: `http://localhost:5002/StuHome?stu_email=${email}` // แก้ไขให้ไม่ต้องเป็น array
      });

    }

    // ถ้าไม่พบข้อมูลใน studentdetail ให้ตรวจสอบในตาราง officer
    const officerQuery = `SELECT * FROM officer WHERE officer_email = ? AND password = ?`;
    connection.query(officerQuery, values, (err, officerResult) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err.message);
        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
      }

      // ถ้าพบข้อมูลใน officer แสดงว่าเป็นแอดมิน
      if (officerResult.length > 0) {
        return res.status(200).json({
          message: 'เข้าสู่ระบบสำเร็จในฐานะแอดมิน',
          role: 'admin', // เพิ่มข้อมูล role
          officer_email: email, // ส่ง officer_email กลับไป
          redirectUrls: `http://localhost:5002/admin/Home?officer_email=${email}` // แก้ไขให้ไม่ต้องเป็น array
        });
      }

      // ถ้าไม่พบข้อมูลทั้งใน studentdetail และ officer
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    });
  });
});

// API: เช็ครหัสผ่านอีกรอบ
app.post("/checkPin", (req, res) => {
  const { email, pin } = req.body;

  if ( !email ) {
    return res.status(400).json({ error: 'กรุณาระบุอีเมลา' });
  }
  if ( !pin ) {
    return res.status(400).json({ error: 'กรุณาระบุpin' });
  }

  // ค้นหา Officer จาก email
  connection.query("SELECT password FROM officer WHERE officer_email = ?", [email], (error, rows) => {
    if (error) {
      console.error("เกิดข้อผิดพลาดในคำสั่ง SQL:", error);
      return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์", error: error.message });
    }

    if (rows.length === 0) {
      return res.json({ success: false, message: "ไม่พบเจ้าหน้าที่" });
    }

    const storedPassword = rows[0].password; // ดึง password จากฐานข้อมูล

    console.log("รหัสที่ดึงจากฐานข้อมูล:", storedPassword);  // ตรวจสอบรหัสที่เก็บในฐานข้อมูล

    if (pin === storedPassword) {
      return res.json({ success: true, message: "PIN ถูกต้อง" });
    } else {
      return res.json({ success: false, message: "PIN ไม่ถูกต้อง" });
    }
  });
});

// Endpoint หน้าเเรกของเด็ก student
app.get('/StuHome', (req, res) => {
  const { stu_email } = req.query; // รับค่า stu_email จาก query string

  if (!stu_email) {
    return res.status(400).json({ error: 'กรุณาระบุ stu_email' });
  }

  const facultyQuery = `
    SELECT 
      f.faculty_name,
      f.faculty_engName,  
      f.number,
      f.Amount_borrowed
    FROM 
      studentdetail s
    LEFT JOIN 
      faculty_subject fs ON s.stu_faculty = fs.subjectId
    LEFT JOIN 
      faculty f ON fs.facultyId  = f.id
    WHERE 
      s.stu_email = ?
  `;

  const borrowHistoryQuery = `
    SELECT 
      b.borrow_id,
      b.request_date,
      b.borrow_date,
      b.return_date,
      b.renew_date,
      b.status,
      b.document,
      b.laptop_tag,
      witness.stu_fname AS witness_fname,
      witness.stu_lname AS witness_lname
    FROM 
      borrow b
    LEFT JOIN 
      studentdetail witness ON b.witness = witness.stu_id
    LEFT  JOIN 
      studentdetail s ON b.stu_id = s.stu_id
    WHERE 
      s.stu_email = ?;
  `;

  const controlRequestQuery = `
    SELECT 
      control_id,
      start,
      end,
      status
    FROM 
      control_request
    ORDER BY 
      control_id DESC limit 1;
  `;

  const facultyDataPromise = new Promise((resolve, reject) => {
    connection.query(facultyQuery, [stu_email], (err, results) => {
      if (err) {
        console.error('Error fetching faculty data:', err);
        return reject(err);
      }
      if (results.length === 0) {
        console.warn(`No faculty data found for email: ${stu_email}`);
      }
      resolve(results);
    });
  });

  const borrowHistoryPromise = new Promise((resolve, reject) => {
    connection.query(borrowHistoryQuery, [stu_email], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

  // ใช้ Promise.all เพื่อรัน Query ทั้งสองพร้อมกัน
  Promise.all([facultyDataPromise, borrowHistoryPromise])
    .then(([facultyDataResults, borrowHistoryResults]) => {
      if (!facultyDataResults.length && !borrowHistoryResults.length) {
        return res.status(404).json({ error: 'ไม่พบข้อมูล' });
      }

      res.json({
        facultyData: facultyDataResults,
        borrowHistory: borrowHistoryResults,

      });
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ', details: error });
    });
});

/// Endpoint สำหรับดึงข้อมูลนักศึกษา (nav student)
app.get('/borrowStuData', (req, res) => {
  const stu_email = req.query.stu_email;

  // ตรวจสอบว่า stu_email ถูกส่งมาหรือไม่
  if (!stu_email) {
    return res.status(400).json({ error: 'Student email is required' });
  }

  const selectStudentQuery = `
  SELECT 
      stu_id, 
      stu_fname, 
      stu_lname,
      stu_idcard, 
      f.faculty_name 
  FROM 
      studentdetail s
  LEFT JOIN 
      faculty_subject fs ON s.stu_faculty = fs.subjectId
  LEFT JOIN 
      faculty f ON fs.facultyId = f.id
  WHERE 
      s.stu_email = ?;

  `;

  connection.query(selectStudentQuery, [stu_email], (err, result) => {
    if (err) return res.status(500).send(err);

    //console.log('Query Results:', result); // Debugging

    // ตรวจสอบว่าไม่มีข้อมูลในผลลัพธ์
    if (result.length === 0) {
      return res.status(404).json({ error: 'No student data found' });
    }

    res.json(result);
  });
});

// Endpoint สำหรับดึงข้อมูลเจ้าหน้าที่
app.get('/navOfficerData', (req, res) => {
  const officer_email = req.query.officer_email;

  //console.log('Officer Email:', officer_email); // Debugging

  // ตรวจสอบว่า officer_email ถูกส่งมาหรือไม่
  if (!officer_email) {
    return res.status(400).json({ error: 'Officer email is required' });
  }

  const selectOfficerQuery = `
    SELECT 
      officer_id, 
      officer_fname, 
      officer_lname, 
      officer_email 
    FROM officer 
    WHERE officer_email = ?;
  `;

  connection.query(selectOfficerQuery, [officer_email], (err, results) => {
    if (err) {
      console.error('Database Error:', err); // Debugging
      return res.status(500).send(err);
    }

    //console.log('Query Results:', results); // Debugging

    // ตรวจสอบว่าไม่มีข้อมูลในผลลัพธ์
    if (results.length === 0) {
      return res.status(404).json({ error: 'No officer data found' });
    }

    res.json(results);
  });
});


// Endpoint  หน้าส่งคำร้องของนศ. 
app.post('/borrow', upload.single('document'), (req, res) => {
  const { stu_phone, witness } = req.body;
  const request_date = new Date();
  const stu_email = req.body.stu_email;

  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  if (!req.file.buffer) {
    return res.status(400).json({ status: 'error', message: 'File buffer is empty' });
  }

  // ตรวจสอบเวลาปัจจุบันกับช่วงเวลาใน control_request
  const checkControlRequestQuery = `
    SELECT start, end 
    FROM control_request 
    ORDER BY control_id DESC 
    LIMIT 1
  `;

  connection.query(checkControlRequestQuery, (err, controlResult) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error', error: err });

    if (controlResult.length === 0) {
      return res.status(400).json({ status: 'error', message: 'ไม่สามารถตรวจสอบช่วงเวลาได้' });
    }

    const { start, end } = controlResult[0];
    const currentTime = new Date();

    if (currentTime < new Date(start) || currentTime > new Date(end)) {
      return res.status(400).json({ status: 'error', message: 'ไม่อยู่ในช่วงเวลาในการยื่นคำร้อง' });
    }

    // ดึง stu_id ของนักศึกษา
    const selectStudentQuery = 'SELECT stu_id FROM studentdetail WHERE stu_email = ?';
    connection.query(selectStudentQuery, [stu_email], (err, studentResult) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Database error', error: err });

      if (studentResult.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Student not found' });
      }

      const stu_id = studentResult[0].stu_id;
      if (!stu_id) {
        return res.status(400).json({ status: 'error', message: 'Student ID cannot be null' });
      }

      // ตรวจสอบรหัสนักศึกษาของพยาน
      const selectWitnessQuery = 'SELECT stu_id FROM studentdetail WHERE stu_id = ?';
      connection.query(selectWitnessQuery, [witness], (err, witnessResult) => {
        if (err) return res.status(500).json({ status: 'error', message: 'Database error', error: err });

        if (witnessResult.length === 0) {
          return res.status(400).json({ status: 'error', message: 'ไม่พบข้อมูลพยาน' });
        }

        // ตรวจสอบจำนวนการยืมของคณะ
        const checkFacultyQuery = `
    SELECT 
        f.number, 
        COUNT(b.borrow_id) AS Amount_borrowed
    FROM 
        faculty f
    LEFT JOIN 
        faculty_subject fs ON f.id = fs.facultyId
    LEFT JOIN 
        studentdetail sd ON fs.subjectId = sd.stu_faculty
    LEFT JOIN 
        borrow b ON sd.stu_id = b.stu_id
    WHERE 
        sd.stu_id = ?  
    GROUP BY 
        f.number;
`;

        
        connection.query(checkFacultyQuery,  [stu_id], (err, facultyResult) => {
          if (err) return res.status(500).json({ status: 'error', message: 'จำนวนโน้ตบุ๊กไม่เพียงพอ', error: err });

          if (facultyResult.length > 0) {
            const { number, Amount_borrowed } = facultyResult[0];

            if (Amount_borrowed >= number) {
              return res.status(400).json({
                status: 'error',
                message: 'จำนวนการยืมของพยานเกินจำนวนที่อนุญาต'
              });
            }
          }

          const fileExtension = path.extname(req.file.originalname);
          const fileName = `${stu_id}${fileExtension}`;
          const fileUrl = `/uploads/documents/${fileName}`;
          const filePath = path.join(__dirname, 'uploads', 'documents', fileName);

          fs.writeFile(filePath, req.file.buffer, (err) => {
            if (err) {
              return res.status(500).json({ status: 'error', message: 'Error saving file to server' });
            }

            // ตรวจสอบว่ามีนักศึกษายืมของอยู่หรือไม่
            const checkBorrowQuery = `
              SELECT status 
              FROM borrow 
              WHERE stu_id = ? 
              ORDER BY request_date DESC 
              LIMIT 1
            `;

            connection.query(checkBorrowQuery, [stu_id], (err, borrowResult) => {
              if (err) return res.status(500).json({ status: 'error', message: 'ตรวจสอบข้อมูล', error: err });

              if (borrowResult.length > 0) {
                const latestStatus = borrowResult[0].status ? borrowResult[0].status.trim() : '';

                if (latestStatus !== 'คืนสำเร็จ') {
                  return res.status(400).json({ status: 'error', message: 'คุณได้ส่งคำขอยืมแล้ว.' });
                }
              }

              // อัปเดตเบอร์โทรศัพท์นักศึกษา
              const updateQuery = 'UPDATE studentdetail SET stu_phone = ? WHERE stu_email = ?';
              connection.query(updateQuery, [stu_phone, stu_email], (err) => {
                if (err) return res.status(500).json({ status: 'error', message: 'Database error', error: err });

                // บันทึกคำขอยืมเข้า database
                const insertQuery = 'INSERT INTO borrow (stu_id, witness, request_date, document) VALUES (?, ?, ?, ?)';
                connection.query(insertQuery, [stu_id, witness, request_date, fileUrl], (err) => {
                  if (err) return res.status(500).json({ status: 'error', message: 'Database error', error: err });

                  const responseData = {
                    status: 'success',
                    message: 'ส่งคำร้องสำเร็จ !',
                    redirectUrl: `http://10.198.200.35:5173/ReqHistory?stu_email=${stu_email}`
                  };

                  //console.log("✅ Sending Response:", responseData); // ตรวจสอบใน Console ของ Backend
                  return res.status(200).json(responseData);
                });
              });
            });
          });
        });
      });
    });
  });
});




// หน้าประวัติการยื่นของเด็ก
app.get('/reqHistory', (req, res) => {
  const stu_email = req.query.stu_email;

  // ดึงข้อมูลการยืมจากฐานข้อมูล
  const query = `
    SELECT 
      b.borrow_id, 
      b.renew_date,
      b.request_date, 
      b.borrow_date, 
      b.return_date, 
      b.document AS document,
      b.witness, 
      b.laptop_tag, 
      b.status,
      borrower.stu_fname AS borrower_fname, 
      borrower.stu_lname AS borrower_lname, 
      borrower.stu_id AS borrower_id,
      borrower.stu_faculty AS borrower_faculty, 
      faculty_borrower.faculty_name AS borrower_facultyname,
      borrower.stu_email AS borrower_email, 
      borrower.stu_phone AS borrower_phone,
      witness.stu_fname AS witness_fname, 
      witness.stu_lname AS witness_lname, 
      witness.stu_id AS witness_id,
      witness.stu_faculty AS witness_faculty,
      faculty_witness.faculty_name AS witness_facultyname, 
      witness.stu_email AS witness_email, 
      witness.stu_phone AS witness_phone,
      laptop.brand AS laptop_brand,
      laptop.model AS laptop_model,
      laptop.serial_number AS laptop_serial_number,
      laptop.cpu AS laptop_cpu,
      laptop.ram AS laptop_ram,
      laptop.storage AS laptop_storage,
      laptop.storage_type AS laptop_storage_type,
      laptop.display AS laptop_display,
      laptop.gpu AS laptop_gpu,
      laptop.os AS laptop_os
    FROM borrow b
    JOIN studentdetail borrower ON b.stu_id = borrower.stu_id
    LEFT JOIN studentdetail witness ON b.witness = witness.stu_id
    LEFT JOIN faculty_subject fs ON borrower.stu_faculty = fs.subjectId  -- เชื่อมกับ faculty_subject
    LEFT JOIN faculty faculty_borrower ON fs.facultyId = faculty_borrower.id -- เชื่อมกับ faculty ของผู้ยืม
    LEFT JOIN faculty_subject fs_witness ON witness.stu_faculty = fs_witness.subjectId -- เชื่อมกับ faculty_subject ของพยาน
    LEFT JOIN faculty faculty_witness ON fs_witness.facultyId = faculty_witness.id -- เชื่อมกับ faculty ของพยาน
    LEFT JOIN laptop ON b.laptop_tag = laptop.laptop_tag -- เชื่อมกับตาราง laptop โดยใช้ laptop_tag
    WHERE borrower.stu_email = ?;

  `;

  connection.query(query, [stu_email], (err, result) => {
    if (err) return res.status(500).send(err);

    if (result.length > 0) {
      // ส่งข้อมูลการยืม รวมถึงเอกสารที่แปลงเป็น base64
      res.json(result);
    } else {
      res.status(404).json({ error: 'ไม่พบประวัติการยืม' });
    }
  });
});


// API: สำหรับดึงข้อมูลการยืม หน้า DetailsReq admin
app.get('/detailsReq/:borrowId', (req, res) => {
  const borrowId = req.params.borrowId; // ✅ ดึงค่า borrowId จาก URL path

  if (!borrowId) {
    return res.status(400).json({ error: "ต้องระบุ borrowId" });
  }

  const query = `
    SELECT 
      b.borrow_id, 
      b.renew_date,
      b.request_date, 
      b.borrow_date, 
      b.return_date, 
      b.document, 
      b.witness, 
      b.laptop_tag, 
      b.status,
      laptop.laptop_tag,
      laptop.serial_number,
      laptop.model,
      laptop.barcode_id,
      borrower.stu_fname AS borrower_fname, 
      borrower.stu_lname AS borrower_lname, 
      borrower.stu_id AS borrower_id,
      borrower.stu_faculty AS borrower_faculty_id, 
      borrower_faculty.faculty_name AS borrower_faculty_name,
      borrower.stu_email AS borrower_email, 
      borrower.stu_phone AS borrower_phone,
      witness.stu_fname AS witness_fname, 
      witness.stu_lname AS witness_lname, 
      witness.stu_id AS witness_id,
      witness.stu_faculty AS witness_faculty_id, 
      witness_faculty.faculty_name AS witness_faculty_name,
      witness.stu_email AS witness_email, 
      witness.stu_phone AS witness_phone
    FROM borrow b
    JOIN studentdetail borrower ON b.stu_id = borrower.stu_id
    LEFT JOIN laptop ON b.laptop_tag = laptop.laptop_tag
    LEFT JOIN faculty_subject fs ON borrower.stu_faculty = fs.subjectId -- เชื่อมกับ faculty_subject สำหรับผู้ยืม
    LEFT JOIN faculty borrower_faculty ON fs.facultyId = borrower_faculty.id -- เชื่อมกับ faculty ของผู้ยืม
    LEFT JOIN studentdetail witness ON b.witness = witness.stu_id
    LEFT JOIN faculty_subject fs_witness ON witness.stu_faculty = fs_witness.subjectId -- เชื่อมกับ faculty_subject สำหรับพยาน
    LEFT JOIN faculty witness_faculty ON fs_witness.facultyId = witness_faculty.id -- เชื่อมกับ faculty ของพยาน
    WHERE b.borrow_id = ?;
  `;

  connection.query(query, [borrowId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลการยืม' });
    }

    const data = result[0];
    return res.json({
      borrowId: data.borrow_id,
      borrower: {
        fname: data.borrower_fname,
        lname: data.borrower_lname,
        id: data.borrower_id,
        faculty: {
          id: data.borrower_faculty_id,
          name: data.borrower_faculty_name,
        },
        email: data.borrower_email,
        phone: data.borrower_phone,
      },
      witness: data.witness_id
        ? {
            fname: data.witness_fname,
            lname: data.witness_lname,
            id: data.witness_id,
            faculty: {
              id: data.witness_faculty_id,
              name: data.witness_faculty_name,
            },
            email: data.witness_email,
            phone: data.witness_phone,
          }
        : null, // กรณีไม่มีพยานให้ส่งค่า `null`
      borrowInfo: {
        requestDate: data.request_date,
        borrowDate: data.borrow_date,
        returnDate: data.return_date,
        renewDate: data.renew_date,
        status: data.status,
      },
      notebookInfo: {
        laptopTag: data.laptop_tag,
        serialNumber: data.serial_number,
        model: data.model,
        barcodeId: data.barcode_id
      },
    });
  });
});





/*************************** เจ้าหน้าที่ *********************/

// API: ฟังก์ชันสร้างบาร์โค้ดและบันทึกไฟล์ลงในโฟลเดอร์
const generateBarcode = (barcode_id) => {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas();
    JsBarcode(canvas, barcode_id, {
      format: 'CODE128',
      displayValue: true,
    });

    // กำหนดพาธสำหรับการบันทึกไฟล์ในโฟลเดอร์ 'uploads/barcodes'
    const filePath = path.join(__dirname, 'uploads', 'barcodes', `${barcode_id}.png`);

    // บันทึกไฟล์ภาพเป็น PNG
    const out = fs.createWriteStream(filePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on('finish', () => {
      //ส่งคืนพาธที่เป็น relative สำหรับการเก็บในฐานข้อมูล
      const relativePath = path.relative(__dirname, filePath);
      resolve(relativePath); // ส่งคืน relative path
    });

    out.on('error', (err) => {
      reject(err);
    });
  });
};

// API: สร้างรายการบาร์โค้ด
const createBarcodes = async (number, maxLaptopTag, data) => {
  const values = [];
  const barcodeIds = new Set();
  let laptopCounter = parseInt(maxLaptopTag.replace('NBKKU', '')) + 1;

  for (let i = 0; i < number; i++) {
    let barcode_id = '30000098'; // ฟิกเลข 9 ตัวแรก

    for (let j = 0; j < 5; j++) {
      barcode_id += Math.floor(Math.random() * 10).toString(); // สุ่มตัวเลข 5 หลักหลัง
    }

    if (!barcodeIds.has(barcode_id)) {
      barcodeIds.add(barcode_id);

      const laptop_tag = `NBKKU${laptopCounter.toString().padStart(4, '0')}`;
      const barcode_img_path = await generateBarcode(barcode_id); // รับพาธของไฟล์ที่บันทึก

      // กำหนดค่า status เป็นค่าเริ่มต้น "ว่างพร้อมใช้งาน"
      const status = 'รอตรวจสอบ';

      // เก็บข้อมูลโน้ตบุ๊กใน values
      values.push([
        barcode_id,
        laptop_tag,
        data.brand,
        data.model,
        data.serial_number,
        data.cpu,
        data.ram,
        data.storage,
        data.storage_type,
        data.gpu,
        data.display,
        data.os,
        data.insurance_date,
        data.warranty_expiry_date,
        data.price,
        barcode_img_path, // เก็บพาธของไฟล์
        status, // ค่า status
        number,
      ]);

      laptopCounter++;
    }
  }
  return values;
};



// API: เพิ่มข้อมูลโน้ตบุ้คด้วยไฟล์ Excel
app.post("/laptopUpload", upload.single("file"), async (req, res) => {
  console.log("Received file:", req.file);
  const { insurance_date, warranty_expiry_date } = req.body; // ดึง insurance_date และ warranty_expiry_date จาก req.body

  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  if (!insurance_date || !warranty_expiry_date) {
    return res.status(400).send("Insurance date and warranty expiry date are required");
  }

  try {
    // อ่านไฟล์ Excel จาก buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    console.log("Sheet names:", sheetNames);

    let allData = [];
    // วนลูปผ่านแต่ละ sheet
    sheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      let data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      data = data.slice(1).map((row) => row.slice(1)); // ตัดแถวแรกและคอลัมน์แรก
      allData = allData.concat(data);
    });

    // สร้างรายการ barcode สำหรับแต่ละแถว
    const insertPromises = allData.map(async (row) => {
      const barcode_id = '30000098' + Math.floor(Math.random() * 100000); // สร้าง barcode_id

      // สร้าง barcode และเก็บพาธของไฟล์ barcode
      const canvas = createCanvas();
      JsBarcode(canvas, barcode_id, { format: 'CODE128', displayValue: true });
      const barcodeImgPath = path.join(__dirname, 'uploads', 'barcodes', `${barcode_id}.png`);
      const out = fs.createWriteStream(barcodeImgPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      return new Promise((resolve, reject) => {
        out.on('finish', () => {
          // เก็บข้อมูลในฐานข้อมูล
          const sql = `
            INSERT INTO laptop 
            (barcode_id, barcode_img, laptop_tag, brand, model, serial_number, status, cpu, gpu, ram, storage, display, os, insurance_date, warranty_expiry_date) 
            VALUES ?
          `;

          const valuesToInsert = [
            [
              barcode_id,
              barcodeImgPath,
              row[2], // laptop_tag
              row[1], // brand
              row[0], // model
              row[3], // serial_number
              'ใช้งานได้', // status
              row[4], // cpu
              row[5], // gpu
              row[6], // ram
              row[7], // storage
              row[8], // display
              row[9], // os
              insurance_date, // รับจาก req.body
              warranty_expiry_date, // รับจาก req.body
            ],
          ];

          connection.query(sql, [valuesToInsert], (err, result) => {
            if (err) {
              console.error("Error inserting data:", err);
              reject(err);
            } else {
              console.log(`Inserted row for laptop_tag: ${row[2]}`);
              resolve(result);
            }
          });
        });

        out.on('error', (err) => {
          console.error("Error saving barcode image:", err);
          reject(err);
        });
      });
    });

    // รอให้การ insert ทั้งหมดเสร็จสิ้น
    await Promise.all(insertPromises);

    // ส่งคำตอบกลับไปยัง client หลังจากที่การ insert ทั้งหมดเสร็จสิ้น
    res.send(` ${insertPromises.length} `);

  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file");
  }
});


// API: เปลี่ยน laptop status เป็น 'ไม่ใช้งาน'
app.post('/deleteSelectedNotebooks', (req, res) => {
  const { laptop_tags } = req.body; // รับ array ของ laptop_tag

  // ตรวจสอบว่า laptop_tags ถูกส่งมาและเป็น array หรือไม่
  if (!Array.isArray(laptop_tags) || laptop_tags.length === 0) {
    return res.status(400).json({ error: 'กรุณาระบุ laptop_tags ที่ถูกต้อง' });
  }

  // คำสั่ง SQL สำหรับเปลี่ยนสถานะโน้ตบุ๊กหลายเครื่อง
  const deleteQuery = `UPDATE laptop SET status = 'ไม่ใช้งาน' WHERE laptop_tag IN (?)`;

  // อัปเดตสถานะในฐานข้อมูล
  connection.query(deleteQuery, [laptop_tags], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดทางฐานข้อมูล โปรดลองใหม่อีกครั้ง' });
    }

    // ตรวจสอบว่ามีการอัปเดตแถวในฐานข้อมูลหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบโน้ตบุ๊กที่ต้องการลบในระบบ' });
    }

    // ส่งข้อความตอบกลับเมื่ออัปเดตสถานะสำเร็จ
    res.status(200).json({
      message: `โน้ตบุ๊ก ${laptop_tags.length} เครื่องถูกเปลี่ยนสถานะเป็น 'ไม่ใช้งาน' เรียบร้อยแล้ว`
    });
  });
});



// API: ดึงข้อมูลหน้ารายการโน้ตบุ้ค
app.get('/notebooklist', (req, res) => {
  const query = 'SELECT brand, model FROM laptop'; // เพิ่ม stu_id ใน SELECT
  connection.query(query, (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
    // กรองข้อมูลไม่ให้มีแบรนด์และรุ่นซ้ำ
    const uniqueResults = Array.from(new Set(results.map(item => item.model)))
      .map(model => results.find(item => item.model === model));
    res.json(results); // ส่งข้อมูลกลับในรูปแบบ JSON
  });
});


// API: ดึงข้อมูลมาเเสดงหน้า detailNB เพื่อแก้ SN 
app.get('/dataEditSN', (req, res) => {
  const { laptop_tag } = req.query;

  if (!laptop_tag) {
    return res.status(400).json({ error: 'กรุณาระบุ laptop_tag' });
  }

  const query = 'SELECT * FROM laptop WHERE laptop_tag = ?';

  connection.query(query, [laptop_tag], (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลโน๊ตบุ๊ค' });
    }

    res.json(results[0]); // ส่งข้อมูลโน๊ตบุ๊คตัวแรกกลับไป
  });
});


// API: ดึงข้อมูลหน้าลิสรายการโน๊ตบุ๊คทั้งหมด
app.get('/allNotebook', (req, res) => {
  const query = `SELECT * FROM laptop
ORDER BY 
  CASE WHEN status = 'ไม่ใช้งาน' THEN 1 ELSE 0 END, 
  laptop_tag ASC; `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }

    res.json(results);
  });
});


// API: อัพเดตสถานะของโน๊ตบุ๊คหน้ารายการโน๊ตบุ๊ค
app.put('/updateStatusAllNotebook', (req, res) => {
  const { laptop_tag, status } = req.body;

  // ตรวจสอบว่า laptop_tag และ status ถูกส่งมาหรือไม่
  if (!laptop_tag || !status) {
    return res.status(400).json({ error: 'Missing laptop_tag or status' });
  }

  // ตรวจสอบว่า status มีค่าที่ถูกต้อง
  const validStatuses = ['ใช้งานได้', 'กำลังใช้งาน', 'ซ่อม','ไม่ใช้งาน'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  // สร้างคำสั่ง SQL เพื่ออัปเดตสถานะและลบค่า note
  const query = `
    UPDATE laptop 
    SET status = ?, note = NULL 
    WHERE laptop_tag = ?;
  `;

  connection.query(query, [status, laptop_tag], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'อัปเดตสถานะและลบค่า note สำเร็จ' });
    } else {
      res.status(404).json({ error: 'ไม่พบโน๊ตบุ๊คที่ต้องการอัปเดต' });
    }
  });
});


const nodemailer = require('nodemailer');


// API: ดึงข้อมูลคำร้องที่มีสถานะ 'รอตรวจสอบ'
app.get('/ApproveRequest', (req, res) => {
  const query = `SELECT 
      b.borrow_id,
      b.request_date,
      b.borrow_date,
      b.status,
      b.document,  -- path ของไฟล์ PDF
      sd.stu_id,
      sd.stu_idcard,
      sd.stu_fname,
      sd.stu_lname,
      sd.stu_email, 
      f.faculty_name AS stu_faculty,
      f.faculty_engName AS stu_Engfaculty
  FROM 
      borrow b
  JOIN 
      studentdetail sd ON b.stu_id = sd.stu_id
  LEFT JOIN 
      faculty_subject fs ON sd.stu_faculty = fs.subjectId  -- แก้จาก 's' เป็น 'sd' สำหรับ studentdetail
  LEFT JOIN 
      faculty f ON fs.facultyId = f.id  -- แก้จาก 's' เป็น 'sd' สำหรับ studentdetail
  WHERE 
      b.status = 'รอตรวจสอบ'
  ORDER BY  
      b.borrow_id ASC;

      
    `;
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching borrow requests' });
    }
    res.json(results);
  });
});


// API: สำหรับอัปเดตสถานะของคำร้องพร้อมส่งอีเมล
app.post('/ApproveRequest/:borrow_id', (req, res) => {
  const { borrow_id } = req.params;
  const { action, note } = req.body; // action คือ 'approve' หรือ 'reject', note คือหมายเหตุ

  // 1. ดึงข้อมูลคำร้องที่มีสถานะ "รอตรวจสอบ" จากฐานข้อมูล
  const selectQuery = `
    SELECT 
        b.borrow_id,
        b.request_date,
        b.borrow_date,
        b.status,
        b.document, -- path ของไฟล์ PDF document
        sd.stu_id,
        sd.stu_fname,
        sd.stu_lname,
        sd.stu_email, -- อีเมลของนักศึกษา
        f.faculty_engName AS stu_faculty
    FROM 
        borrow b
    JOIN 
        studentdetail sd ON b.stu_id = sd.stu_id
    LEFT JOIN 
        faculty_subject fs ON sd.stu_faculty = fs.subjectId  -- เชื่อมกับ faculty_subject
    LEFT JOIN 
        faculty f ON fs.facultyId = f.id  -- เชื่อมกับ faculty ผ่าน facultyId
    WHERE 
        b.status = 'รอตรวจสอบ'  -- เลือกเฉพาะคำร้องที่มีสถานะ "รอตรวจสอบ"
    ORDER BY  
        b.borrow_id ASC;

  `;

  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error("SQL Error:", err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำร้องขอยืมที่รอตรวจสอบ' });
    }

    // ตรวจสอบว่า borrow_id ที่ได้รับมาจาก request มีอยู่ในรายการหรือไม่
    const borrowRequest = results.find((r) => r.borrow_id === parseInt(borrow_id));
    if (!borrowRequest) {
      return res.status(404).json({ error: `ไม่พบคำร้องขอยืมที่มี borrow_id: ${borrow_id}` });
    }

    // 2. รับค่า action และ note ที่ระบุถึง borrow_id นั้น
    let status;
    if (action === 'approve') {
      status = 'รอรับเครื่อง'; // กำหนดสถานะเมื่ออนุมัติ
    } else if (action === 'reject') {
      status = 'ไม่ผ่านเงื่อนไข'; // กำหนดสถานะเมื่อปฏิเสธ

      // 4. ลบข้อมูล document ในฐานข้อมูล (ตั้งค่าเป็น NULL)
      const updateDocumentQuery = `UPDATE borrow SET document = NULL WHERE borrow_id = ?`;
      connection.query(updateDocumentQuery, [borrow_id], (err, updateDocResult) => {
        if (err) {
          console.error("Failed to remove document from database:", err);
          return res.status(500).json({ error: 'Failed to remove document from database', details: err.message });
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // 5. อัปเดตสถานะคำร้อง (UPDATE) หากเจอคำร้อง
    const updateQuery = `UPDATE borrow SET status = ? WHERE borrow_id = ?`;
    connection.query(updateQuery, [status, borrow_id], (err, updateResult) => {
      if (err) {
        console.error("SQL Error:", err);
        return res.status(500).json({ error: 'Failed to update borrow status', details: err.message });
      }

      // 6. ส่งอีเมลแจ้งผลการอนุมัติหรือปฏิเสธไปยังนักศึกษา
      const student = borrowRequest;
      sendEmailToStudent(
        student.stu_email,
        student.stu_fname,
        student.stu_lname,
        status,
        note,
        student,
        res
      );
    });
  });
});


// ฟังก์ชันส่งอีเมล
async function sendEmailToStudent(studentEmail, studentFname, studentLname, status, remarks, borrowData, res) {
  try {
    // สร้าง transporter สำหรับการส่งอีเมลโดยใช้ App Password
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // SMTP Server ของ Gmail
      port: 587, // ใช้ port 587 สำหรับ TLS
      secure: false, // ไม่ใช้ SSL
      auth: {
        user: 'kunita.n@kkumail.com', // อีเมลของคุณ
        pass: 'ummo nzyd bjch jjcp' // App Password ที่ได้จาก Google
      },
      tls: {
        rejectUnauthorized: false // ปิดการตรวจสอบใบรับรอง
      }
    });

    // กำหนดเนื้อหาของอีเมลให้แตกต่างกันระหว่างอนุมัติและปฏิเสธ
    let subject = 'สถานะคำร้องขอยืมโน้ตบุ๊ก มหาวิทยาลัยขอนแก่น';
    let message = `เรียนคุณ ${studentFname} ${studentLname}\n\n`;

    if (status === 'รอรับเครื่อง') {
      message += `คำร้องของคุณได้รับการอนุมัติแล้ว\n\n`;
      message += `ให้นักศึกษาเข้ามาติดต่อขอรับเครื่องโน๊ตบุ๊ค ที่จุดบริการยืม-คืนโน๊ตบุ๊ค (หอสมุดกลาง ชั้น 5 ) ยืมแบบปกติ 2 เดือน ภายใน 7 วันหลังจากนี้\n`;
      message += `หมายเหตุ \n`
      message += `1. มารับภายในระยะเวลาที่กำหนด หากเป็นวันหยุดหรือวันนักขัตฤกษ์ให้เลื่อนไปวันทำการวันถัดไป\n`
      message += `2. ติดธุระหรือได้รับเครื่องแล้ว โปรดแจ้งเมลกลับ\n\n`;
      message += `** เงื่อนไขในการยืมเครื่องโน๊ตบุ๊ค **
      "เอกสารที่ใช้สำหรับยืมโน้ตบุ๊ค"
      1. บัตรประจำตัวนักศึกษา (บัตรนักศึกษาตัวจริงเท่านั้น)
      2. พยาน 1 คน (พร้อมบัตรนักศึกษาตัวจริงเท่านั้น)
      \t-ต้องมีพยานมาเซ็นรับรองในการยืมเครื่องโน๊ตบุ๊คทุกครั้ง
      \t-บัตรนักศึกษาตัวจริงเท่านั้น (บัตรหาย ติดต่อทำใหม่ที่ตึกพิมลก่อน)\n\n`;

      message += `**เคาร์เตอร์เปิดให้บริการ จ-ศ เวลา 09.00-12: และ เวลา 13:00-16:00 น. ปิด ส-อ และวันหยุดนักขัตฤกษ์ **\n\n`;
      
      message += `** พี่รถเมล์ 062-1954643 **\n`;
      message += `ตำแหน่ง : Technical Support, Addmin notebooks, Counter for borrow and return notebooks.\n`;
      message += `Librarian of The Academic Resources, Khon Kean University\n`;
      message += `Khon Kean, Thailand\n`;
      message += `123 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40002\n`;
      message += `โทรศัพท์ 043-009700 ต่อ 42001ม46123-4\n`;
      message += `ทรสาร 043-202541-50839\n\n`;

      message += `//////////////////////////////////////////////////////////////////////////\n\n`;

      message += `Your request has been approved.\n\n`;

      message += `Students can come to the notebook borrowing and return service point (5th floor of the Central Library) to receive a regular 2-month loan within 7 days from now.\n`;

      message += `Note\n`;
      message += `1. Come to receive it within the specified time. If it is a holiday or public holiday, postpone it to the next business day.\n`;
      message += `2. If you are busy or have received the device, please notify us by email.\n\n`;
      
      message += `** Within the specified time only. **
      "Documents used for borrowing notebooks"
      1. Student ID card (real student card only)
      2. 1 witness (with original student ID only)\n\n`;
      
      message += `**Counter Mon-Fri time 09.00-12:00 and time 13:00-16:00 Closed Sat. - Sun. and public holidays.\n\n`;

      message += `** พี่รถเมล์ Tel. 062-1954643 **\n`;
      message += `position : Technical Support, Addmin notebooks, Service counter for borrowing-returning laptop.\n`;
      message += `Librarian of The Academic Resources, Khon Kean University\n`;
      message += `Khon Kean, Thailand\n`;
      message += `Tel.043-202541-50839\n`;
      
      } 
      
      else if (status === 'ไม่ผ่านเงื่อนไข') {
        message += `ขออภัย คำร้องของคุณไม่ได้รับการอนุมัติ \n\n`;
        message += `เนื่องจาก ${remarks}\n\n`;
        message += `หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่\n\n`;

        message += `**เคาร์เตอร์เปิดให้บริการ จ-ศ เวลา 09.00-12: และ เวลา 13:00-16:00 น. ปิด ส-อ และวันหยุดนักขัตฤกษ์ **\n\n`;
      
        message += `** พี่รถเมล์ 062-1954643 **\n`;
        message += `ตำแหน่ง : Technical Support, Addmin notebooks, Counter for borrow and return notebooks.\n`;
        message += `Librarian of The Academic Resources, Khon Kean University\n`;
        message += `Khon Kean, Thailand\n`;
        message += `123 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40002\n`;
        message += `โทรศัพท์ 043-009700 ต่อ 42001ม46123-4\n`;
        message += `โทรสาร 043-202541-50839\n\n`;

        message += `//////////////////////////////////////////////////////////////////////////\n\n`;

        message += `Your request was not approved.\n\n`;

        message += `Because of that ${remarks}\n\n`;

        message += `If you have any questions, please contact the admin.\n`;

        message += `**Counter Mon-Fri time 09.00-12:00 and time 13:00-16:00 Closed Sat. - Sun. and public holidays.\n\n`;

      message += `** พี่รถเมล์ Tel. 062-1954643 **\n`;
      message += `position : Technical Support, Addmin notebooks, Service counter for borrowing-returning laptop.\n`;
      message += `Librarian of The Academic Resources, Khon Kean University\n`;
      message += `Khon Kean, Thailand\n`;
      message += `Tel.043-202541-50839\n`;
      
    }


    // ตั้งค่าการส่งอีเมล
    const mailOptions = {
      from: 'kunita.n@kkumail.com', // อีเมลของคุณ
      to: studentEmail, // อีเมลของนักศึกษา
      subject: subject,
      text: message
    };

    // ส่งอีเมล
    await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully to:', studentEmail);
    if (!res.headersSent) {
      res.json({
        message: 'สถานะคำร้องถูกอัปเดตเรียบร้อย',
        borrowData: {
          borrow_id: borrowData.borrow_id,
          status: status,
          note: remarks,
        }
      });
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error sending email', details: error.message });
    }
  }
}




// API: ดึงข้อมูงหน้ารายละเอียดหน้าแรกของแอดมิน 
app.get('/ApproveRequestDT', (req, res) => {
  const borrow_id = req.query.borrow_id; // หรือใช้ req.params.borrow_id หากส่งผ่าน URL params

  if (!borrow_id) {
    return res.status(400).json({ error: 'กรุณาระบุ borrow_id' });
  }

  const query = `
    SELECT 
      b.borrow_id, 
      b.renew_date, 
      b.borrow_date, 
      b.return_date, 
      b.document AS document,
      b.witness, 
      b.laptop_tag, 
      b.status,
      borrower.stu_fname AS borrower_fname, 
      borrower.stu_lname AS borrower_lname, 
      borrower.stu_id AS borrower_id,
      borrower.stu_idcard AS borrower_idcard,
      borrower.stu_faculty AS borrower_faculty,
      borrower.stu_email AS borrower_email,
      borrower.college_years AS borrower_collegeyears, 
      faculty_borrower.faculty_name AS borrower_facultyname,
      faculty_borrower.faculty_engName AS borrower_facultyEngName,
      borrower.stu_email AS borrower_email, 
      borrower.stu_phone AS borrower_phone,
      witness.stu_fname AS witness_fname, 
      witness.stu_lname AS witness_lname, 
      witness.stu_id AS witness_id,
      witness.stu_idcard AS witness_idcard,
      witness.stu_faculty AS witness_faculty,
      witness.stu_email AS witness_email,
      witness.college_years AS witness_collegeyears,
      faculty_witness.faculty_name AS witness_facultyname, 
      witness.stu_email AS witness_email, 
      witness.stu_phone AS witness_phone,
      laptop.brand AS laptop_brand,
      laptop.model AS laptop_model,
      laptop.serial_number AS laptop_serial_number,
      laptop.cpu AS laptop_cpu,
      laptop.ram AS laptop_ram,
      laptop.storage AS laptop_storage,
      laptop.storage_type AS laptop_storage_type,
      laptop.display AS laptop_display,
      laptop.gpu AS laptop_gpu,
      laptop.os AS laptop_os,
      laptop.barcode_id
    FROM 
    borrow b
    JOIN 
        studentdetail borrower ON b.stu_id = borrower.stu_id
    LEFT JOIN 
        studentdetail witness ON b.witness = witness.stu_id
    LEFT JOIN 
        faculty_subject fs_borrower ON borrower.stu_faculty = fs_borrower.subjectId  -- เชื่อมกับ faculty_subject ของ borrower
    LEFT JOIN 
        faculty faculty_borrower ON fs_borrower.facultyId = faculty_borrower.id  -- เชื่อมกับ faculty ของ borrower
    LEFT JOIN 
        faculty_subject fs_witness ON witness.stu_faculty = fs_witness.subjectId  -- เชื่อมกับ faculty_subject ของ witness
    LEFT JOIN 
        faculty faculty_witness ON fs_witness.facultyId = faculty_witness.id  -- เชื่อมกับ faculty ของ witness
    LEFT JOIN 
        laptop ON b.laptop_tag = laptop.laptop_tag
    WHERE 
        b.borrow_id = ?; -- ต้องใช้ b.borrow_id 
  `;

  connection.query(query, [borrow_id], (err, result) => {
    if (err) {
      console.error('Database error:', err); // Log ข้อผิดพลาดเพื่อช่วยดีบัก
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }

    if (result.length > 0) {
      res.json(result[0]); // ส่งข้อมูลในรูปแบบ JSON
    } else {
      res.status(404).json({ error: 'ไม่พบประวัติการยืม' });
    }
  });
});


// API: ดึงข้อมูลคำร้องที่มีสถานะ 'รอรับเครื่อง'
app.get('/waiting', (req, res) => {
  const query = `SELECT 
    b.borrow_id,
    b.request_date,
    b.borrow_date,
    b.status,
    b.document,
    sd.stu_id,
    sd.stu_fname,
    sd.stu_lname,
    sd.stu_email,
    sd.stu_idcard,
    f.faculty_name AS stu_faculty,
    f.faculty_engName AS stu_Engfaculty,
    laptop.laptop_tag
  FROM 
    borrow b
  JOIN 
    studentdetail sd ON b.stu_id = sd.stu_id
  LEFT JOIN 
      faculty_subject fs ON sd.stu_faculty = fs.subjectId
  LEFT JOIN 
      faculty f ON fs.facultyId  = f.id
  LEFT JOIN 
    laptop ON b.laptop_tag = laptop.laptop_tag
  WHERE 
    b.status = 'รอรับเครื่อง'
  ORDER BY  b.borrow_id ASC;
  `;
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching borrow requests' });
    }
    res.json(results);
  });
});



// API: ส่งข้อมูลการยืม 'laptop_tag'
app.patch('/waitingDT', (req, res) => {
  const borrowId = req.query.borrowId; // ดึง borrowId จาก query string
  const { status, laptop_tag, officer_email } = req.body; // ดึง status และ laptop_tag จาก body
 
  //console.log('Received data:', req.body);

  // ตรวจสอบว่า borrowId, laptop_tag และ officer_email ถูกส่งมาหรือไม่
  if (!borrowId) {
    return res.status(400).json({ error: "ต้องระบุ borrowId" });
  }

  if (!laptop_tag || laptop_tag.trim() === '') {
    return res.status(400).json({ error: "ต้องระบุ laptop_tag" });
  }

  if (!officer_email) {
    return res.status(400).json({ error: "ต้องระบุ officer_email" });
  }

  // ค้นหา officer_id จาก officer_email
  const getOfficerIdQuery = `SELECT officer_id FROM officer WHERE officer_email = ?`;
  connection.query(getOfficerIdQuery, [officer_email], (err, result) => {
    if (err) {
      console.error("Error fetching officer_id:", err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหา officer_id' });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "ไม่พบ officer_email นี้ในระบบ" });
    }

    const officerId = result[0].officer_id;

    // ตรวจสอบ laptop_tag ในฐานข้อมูล
    const checkLaptopTagQuery = `SELECT laptop_tag, status FROM laptop WHERE laptop_tag = ?`;
    connection.query(checkLaptopTagQuery, [laptop_tag], (err, result) => {
      if (err) {
        console.error("Error checking laptop tag:", err);
        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบ laptop_tag' });
      }

      if (result.length === 0) {
        return res.status(400).json({ error: "laptop_tag นี้ไม่พบในระบบ" });
      }

      const currentLaptopStatus = result[0].status;
      if (currentLaptopStatus !== 'ใช้งานได้') {
        console.warn(`ไม่สามารถดำเนินการต่อได้: Laptop [${laptop_tag}] มีสถานะ '${currentLaptopStatus}'`);
        return res.status(400).json({
          error: `ไม่สามารถดำเนินการต่อได้ เนื่องจากสถานะแล็ปท็อปคือ '${currentLaptopStatus}' ซึ่งไม่ใช่สถานะ 'ใช้งานได้'`
        });
      }

      // ดึง return_date จาก control_request
      const getControlRequestQuery = `SELECT end,control_id FROM control_request ORDER BY control_id DESC LIMIT 1`;
      connection.query(getControlRequestQuery, (err, result) => {
        if (err) {
          console.error("Error fetching control_request end:", err);
          return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล control_request' });
        }

        if (result.length === 0) {
          return res.status(400).json({ error: 'ไม่พบข้อมูลใน control_request' });
        }

        const returnDate = result[0].end;
        //const borrowDate = new Date().toISOString().split('T')[0];
        const controlId = result[0].control_id;

        // อัปเดตข้อมูล borrow รวม officer_borrow
        const updateQuery = `
          UPDATE borrow
          SET status = 'ยืมสำเร็จ', laptop_tag = ?, return_date = ?, borrow_date = NOW(), officer_borrow = ?, control_id = ?
          WHERE borrow_id = ?
        `;
        const queryParams = [laptop_tag, returnDate, officerId, controlId, borrowId];

        connection.query(updateQuery, queryParams, (err, result) => {
          if (err) {
            console.error("Error executing update query:", err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลการยืม' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'ไม่พบ borrow_id ที่ต้องการอัปเดต' });
          }

          const updateLaptopQuery = `UPDATE laptop SET status = 'กำลังใช้งาน' WHERE laptop_tag = ?`;
          connection.query(updateLaptopQuery, [laptop_tag], (err, result) => {
            if (err) {
              console.error("Error updating laptop status:", err);
              return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะแล็ปท็อป' });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'ไม่พบแล็ปท็อปที่ต้องการอัปเดต' });
            }

            const getStuIdQuery = `SELECT stu_id FROM borrow WHERE borrow_id = ?`;
            connection.query(getStuIdQuery, [borrowId], (err, result) => {
              if (err) {
                console.error("Error fetching stu_id:", err);
                return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึง stu_id' });
              }

              if (result.length === 0) {
                return res.status(400).json({ error: "ไม่พบ borrow_id ในระบบ" });
              }

              const stuId = result[0].stu_id;

              // ดึง stu_faculty จาก studentdetail
              const getFacultyQuery = `
              SELECT 
                  f.id AS faculty_id,  -- เพิ่ม f.id เพื่อให้ใช้ตอนอัปเดต
                  f.faculty_name AS stu_faculty_name
              FROM 
                  studentdetail s
              LEFT JOIN 
                  faculty_subject fs ON s.stu_faculty = fs.subjectId
              LEFT JOIN 
                  faculty f ON fs.facultyId = f.id
              WHERE 
                  s.stu_id = ?;

              `;
              connection.query(getFacultyQuery, [stuId], (err, result) => {
                if (err) {
                  console.error("Error fetching stu_faculty:", err);
                  return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึง stu_faculty' });
                }

                if (result.length === 0) {
                  return res.status(400).json({ error: "ไม่พบ stu_id ในระบบ studentdetail" });
                }

                const facultyId = result[0].faculty_id;

                // อัปเดต Amount_borrowed ในตาราง faculty
                const updateFacultyQuery = `UPDATE faculty SET Amount_borrowed = Amount_borrowed + 1 WHERE id = ?`;
                connection.query(updateFacultyQuery, [facultyId], (err, result) => {
                  if (err) {
                    console.error("Error updating faculty Amount_borrowed:", err);
                    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดต Amount_borrowed ของคณะ' });
                  }

                  if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'ไม่พบ faculty_id ที่ต้องการอัปเดต' });
                  }

                  const selectQuery = `
                      SELECT 
                        b.borrow_id, 
                        b.return_date, 
                        b.laptop_tag, 
                        b.status, 
                        b.borrow_date,
                        borrower.stu_fname AS borrower_fname, 
                        borrower.stu_lname AS borrower_lname,
                        borrower.stu_id AS borrower_id, 
                        borrower.stu_faculty AS borrower_faculty,
                        borrower.stu_email AS borrower_email, 
                        borrower.stu_phone AS borrower_phone,
                        witness.stu_fname AS witness_fname, 
                        witness.stu_lname AS witness_lname,
                        witness.stu_id AS witness_id, 
                        witness.stu_faculty AS witness_faculty,
                        witness.stu_email AS witness_email, 
                        witness.stu_phone AS witness_phone,
                        laptop.status AS laptop_status,
                        f.faculty_name AS borrower_faculty_name,  -- ชื่อคณะของผู้ยืม
                        f.faculty_engName AS borrower_faculty_engname,  -- ชื่อคณะภาษาอังกฤษของผู้ยืม
                        wf.faculty_name AS witness_faculty_name,  -- ชื่อคณะของพยาน
                        wf.faculty_engName AS witness_faculty_engname  -- ชื่อคณะภาษาอังกฤษของพยาน
                    FROM 
                        borrow b
                    JOIN 
                        studentdetail borrower ON b.stu_id = borrower.stu_id
                    LEFT JOIN 
                        studentdetail witness ON b.witness = witness.stu_id
                    LEFT JOIN 
                        laptop ON b.laptop_tag = laptop.laptop_tag
                    LEFT JOIN 
                        faculty_subject fs ON borrower.stu_faculty = fs.subjectId  -- เชื่อมกับ faculty_subject สำหรับผู้ยืม
                    LEFT JOIN 
                        faculty f ON fs.facultyId = f.id  -- เชื่อมกับ faculty สำหรับผู้ยืม
                    LEFT JOIN 
                        faculty_subject fs_witness ON witness.stu_faculty = fs_witness.subjectId  -- เชื่อมกับ faculty_subject สำหรับพยาน
                    LEFT JOIN 
                        faculty wf ON fs_witness.facultyId = wf.id  -- เชื่อมกับ faculty สำหรับพยาน
                    WHERE 
                        b.borrow_id = ?;

                    `;
                  connection.query(selectQuery, [borrowId], (err, result) => {
                    if (err) {
                      console.error("Error fetching updated data:", err);
                      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
                    }

                    if (result.length > 0) {
                      return res.json(result[0]);
                    } else {
                      return res.status(404).json({ error: 'ไม่พบข้อมูลการยืม' });
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});


// API: ดึงข้อมูลมาแสดงเวลาพิมพ์ laptop_tag ที่ต้องการ
app.patch('/laptop', (req, res) => {
  const { laptop_tag } = req.body;

  if (!laptop_tag) {
    return res.status(400).json({ error: 'กรุณาระบุ laptop_tag' });
  }

  const checkQuery = `
      SELECT * FROM laptop WHERE laptop_tag = ?
  `;

  connection.query(checkQuery, [laptop_tag], (err, results) => {
    if (err) {
      console.error('Error fetching laptop data:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล laptop' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'ไม่พบ laptop_tag ที่ระบุ' });
    }

    res.json(results[0]); // ส่งข้อมูล laptop ที่พบ
  });
});



// API: ส่งข้อมูลหน้ารายละเอียดของกำลังยืม 'renew', 'return'
app.post('/borrowDT', (req, res) => {
  const { borrow_id, action, laptop_status, note, officer_email } = req.body;

  // 2. ตรวจสอบว่า borrow_id มีค่า
  if (!borrow_id) {
    return res.status(400).json({ error: 'กรุณาระบุ borrow_id' });
  }
  if (!action) {
    return res.status(400).json({ error: 'กรุณาระบุ action' });
  }
  if (!officer_email) {
    return res.status(400).json({ error: 'ต้องระบุ officer_email' });
  }

  // ค้นหาข้อมูล officer_id จาก officer_email
  const getOfficerIdQuery = `SELECT officer_id FROM officer WHERE officer_email = ?`;
  connection.query(getOfficerIdQuery, [officer_email], (err, result) => {
    if (err) {
      console.error("Error fetching officer_id:", err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหา officer_id' });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "ไม่พบ officer_email นี้ในระบบ" });
    }

    const officerId = result[0].officer_id;

    if (action === 'return') {
      if (!laptop_status) {
        return res.status(400).json({ error: 'กรุณาระบุสถานะของเครื่อง' });
      }

      const updateBorrowQuery = `
        UPDATE borrow 
        SET status = 'คืนสำเร็จ', return_date = NOW(), officer_return = ?
        WHERE borrow_id = ?;
      `;

      const updateLaptopQuery = `
        UPDATE laptop 
        SET status = 'ใช้งานได้', note = ?
        WHERE laptop_tag = (SELECT laptop_tag FROM borrow WHERE borrow_id = ?);
      `;

      const checkLaptopStatusQuery = `
        SELECT l.status AS laptop_status, s.stu_faculty
        FROM borrow b
        JOIN laptop l ON b.laptop_tag = l.laptop_tag
        JOIN studentdetail s ON b.stu_id = s.stu_id
        WHERE b.borrow_id = ?;
      `;

      const updateFacultyQuery = `
        UPDATE faculty 
        SET Amount_borrowed = GREATEST(Amount_borrowed - 1, 0) 
        WHERE id = (
            SELECT fs.facultyId 
            FROM faculty_subject fs
            WHERE fs.subjectId = ?
            LIMIT 1
    );
      `;

      const getFacultyIdQuery = `
        SELECT f.id AS faculty_id
        FROM studentdetail sd
        LEFT JOIN faculty_subject fs ON sd.stu_faculty = fs.subjectId
        LEFT JOIN faculty f ON fs.facultyId = f.id
        WHERE sd.stu_id = ?;
      `;

      connection.beginTransaction((err) => {
        if (err) {
          console.error('Transaction error:', err);
          return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเริ่มต้นการทำธุรกรรม' });
        }

        // ตรวจสอบสถานะ laptop และดึงข้อมูล stu_faculty
        connection.query(checkLaptopStatusQuery, [borrow_id], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะแล็ปท็อป' });
            });
          }

          if (result.length === 0) {
            return connection.rollback(() => {
              return res.status(404).json({ error: 'ไม่พบข้อมูลแล็ปท็อปสำหรับ borrow_id นี้' });
            });
          }

          const { laptop_status: currentLaptopStatus, stu_faculty } = result[0];

          // อัปเดต borrow
          connection.query(updateBorrowQuery, [officerId, borrow_id], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลการคืนเครื่อง' });
              });
            }

            // เพิ่มใหม่ 
            connection.query(updateLaptopQuery, [ note || null, borrow_id], (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  console.error('Database error:', err);
                  return res.status(500).json({
                    status: 'error',
                    message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะเครื่อง'
                  });
                });
              }

              // ลด Amount_borrowed ของคณะ
              connection.query(updateFacultyQuery, [stu_faculty], (err, result) => {
                if (err) {
                  return connection.rollback(() => {
                    console.error('Database error:', err);
                    return res.status(500).json({
                      status: 'error',
                      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลคณะ'
                    });
                  });
                }
              });

              // ยืนยันการทำธุรกรรม
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    console.error('Transaction commit error:', err);
                    return res.status(500).json({
                      status: 'error',
                      message: 'เกิดข้อผิดพลาดในการยืนยัน'
                    });
                  });
                }

                return res.json({
                  status: 'success', // เพิ่ม status success
                  message: 'คืนเครื่องสำเร็จ !'
                });
              });
            });
          });
        });
      });
    } else if (action === 'renew') {
      // ดึงค่า end ล่าสุดจาก control_request โดยใช้ borrow.control_id
      const getEndDateQuery = `
        SELECT end 
        FROM control_request
        WHERE control_id = (SELECT control_id FROM borrow WHERE borrow_id = ?)
        ORDER BY control_id DESC
        LIMIT 1;
      `;

      connection.query(getEndDateQuery, [borrow_id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก control_request' });
        }

        if (result.length === 0) {
          return res.status(404).json({ error: 'ไม่พบข้อมูลใน control_request สำหรับ borrow_id นี้' });
        }

        const endDate = result[0].end;  // ค่า end ล่าสุดจาก control_request
        // const renewDate = new Date();   // วันที่ทำการ renew
        // const borrowDate = new Date().toISOString();

        // คำสั่ง SQL เพื่ออัปเดตตาราง borrow
        const updateRenewQuery = `
          UPDATE borrow 
          SET status = 'ยืมสำเร็จ', borrow_date = NOW(), renew_date = NOW(), return_date = ?, officer_return = ?
          WHERE borrow_id = ?;
        `;

        connection.query(updateRenewQuery, [endDate, officerId, borrow_id], (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              status: 'error', // เพิ่ม status error
              message: 'เกิดข้อผิดพลาดในการต่ออายุการยืม'
            });
          }

          return res.json({
            status: 'success', // เพิ่ม status success
            message: 'ต่ออายุการยืมสำเร็จ'
          });
        });
      });
    } else if (action === 'repair') {
      const updateRepairQuery = `
        UPDATE laptop 
        SET status = 'ซ่อม', note = ?
        WHERE laptop_tag = (SELECT laptop_tag FROM borrow WHERE borrow_id = ?);
      `;

      connection.query(updateRepairQuery, [note || null, borrow_id], (err) => {
        if (err) return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะซ่อมของเครื่อง' });

        return res.json({ status: 'success', message: 'ส่งเครื่องเข้าซ่อมสำเร็จ!' });
      });

    // 6. กรณี action ไม่ถูกต้อง
    } else {
      return res.status(400).json({ error: 'action ไม่ถูกต้อง ต้องเป็น return, renew หรือ repair เท่านั้น' });
    }
  });
});


// API: ดึงข้อมูลคำร้องที่มีสถานะ 'คืนแล้ว'
app.get('/return', (req, res) => {
  const query = `SELECT 
      b.borrow_id,
      b.request_date,
      b.borrow_date,
      b.return_date,
      b.status,
      b.document,  -- path ของไฟล์ PDF
      sd.stu_id,
      sd.stu_idcard,
      sd.stu_fname,
      sd.stu_lname,
      sd.stu_email, -- อีเมลของนักศึกษา
      f.faculty_name AS stu_faculty,
      f.faculty_engName AS stu_Engfaculty,
      laptop.laptop_tag
    FROM 
      borrow b
    JOIN 
      studentdetail sd ON b.stu_id = sd.stu_id
    LEFT JOIN 
        faculty_subject fs ON sd.stu_faculty = fs.subjectId  
    LEFT JOIN 
        faculty f ON fs.facultyId = f.id 
    LEFT JOIN 
      laptop ON b.laptop_tag = laptop.laptop_tag
    WHERE 
      b.status = 'คืนสำเร็จ'
    ORDER BY  b.borrow_id ASC;
    `;
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching borrow requests' });
    }
    res.json(results);
  });
});


// API: ดึงข้อมูลหน้ารายละเอียดของคืนแล้ว
app.get('/returnDT', (req, res) => {
  const borrow_id = req.query.borrow_id;
  if (!borrow_id) {
    return res.status(400).json({ error: 'กรุณาระบุ borrow_id' });
  }

  const query = `
    SELECT 
      b.borrow_id, 
      b.renew_date, 
      b.request_date,
      b.borrow_date, 
      b.return_date, 
      b.document AS document,
      b.witness, 
      b.laptop_tag, 
      b.status,
      borrower.stu_fname AS borrower_fname, 
      borrower.stu_lname AS borrower_lname, 
      borrower.stu_id AS borrower_id,
      borrower.stu_idcard AS borrower_idcard,
      borrower.stu_email AS borrower_email,
      borrower.stu_faculty AS borrower_faculty, 
      borrower.college_years AS borrower_collegeyears,
      faculty_borrower.faculty_name AS borrower_facultyname,
      borrower.stu_email AS borrower_email, 
      borrower.stu_phone AS borrower_phone,
      witness.stu_fname AS witness_fname, 
      witness.stu_lname AS witness_lname, 
      witness.stu_id AS witness_id,
      witness.stu_idcard AS witness_idcard,
      witness.stu_faculty AS witness_faculty,
      witness.college_years AS witness_collegeyears,
      faculty_witness.faculty_name AS witness_facultyname, 
      witness.stu_email AS witness_email, 
      witness.stu_phone AS witness_phone,
      laptop.barcode_id AS barcode_id,
      laptop.brand AS laptop_brand,
      laptop.model AS laptop_model,
      laptop.serial_number AS laptop_serial_number,
      laptop.cpu AS laptop_cpu,
      laptop.ram AS laptop_ram,
      laptop.storage AS laptop_storage,
      laptop.storage_type AS laptop_storage_type,
      laptop.display AS laptop_display,
      laptop.gpu AS laptop_gpu,
      laptop.os AS laptop_os
    FROM borrow b
    JOIN studentdetail borrower ON b.stu_id = borrower.stu_id
    LEFT JOIN studentdetail witness ON b.witness = witness.stu_id
    LEFT JOIN faculty faculty_borrower ON borrower.stu_faculty = faculty_borrower.id
    LEFT JOIN faculty faculty_witness ON witness.stu_faculty = faculty_witness.id
    LEFT JOIN laptop ON b.laptop_tag = laptop.laptop_tag
    WHERE b.borrow_id = ?; -- ต้องใช้ b.borrow_id ตรงกับ borrow_id ที่ส่งมา
  `;

  connection.query(query, [borrow_id], (err, result) => {
    if (err) {
      console.error('Database error:', err); // Log ข้อผิดพลาดเพื่อช่วยดีบัก
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }

    if (result.length > 0) {
      res.json(result[0]); // ส่งข้อมูลในรูปแบบ JSON
    } else {
      res.status(404).json({ error: 'ไม่พบประวัติการยืม' });
    }
  });

});





// API: ดึงข้อมูลรายชื่อเจ้าหน้าที่
app.get('/officers', (req, res) => {
  const query = 'SELECT * FROM officer';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching officers:', err);
      res.status(500).send('Error fetching officers');
      return;
    }
    res.json(results);
  });
});

// API: เพิ่มข้อมูลเจ้าหน้าที่
app.post('/insertOfficer', (req, res) => {
  const { officer_fname, officer_lname, officer_email, password, phone, job_position } = req.body;

  if (!officer_fname || !officer_lname || !officer_email || !password || !phone || !job_position) {
    res.status(400).send('ข้อมูลไม่ครบบถ้วน');
    return;
  }

  const query = 'INSERT INTO officer (officer_fname, officer_lname, officer_email, password, phone, job_position) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [officer_fname, officer_lname, officer_email, password, phone, job_position], (err, results) => {
    if (err) {
      console.error('Error inserting officer:', err);
      res.status(500).send('มีข้อมูลของเจ้าหน้าที่อยู่เเล้ว');
      return;
    }
    res.status(201).send('Officer added successfully');
  });
});

// API: ลบข้อมูลเจ้าหน้าที่
app.delete('/deleteOfficer', (req, res) => {
  const { officer_id } = req.body;

  // ตรวจสอบว่า officer_id ถูกส่งมาหรือไม่
  if (!officer_id) {
    return res.status(400).json({ error: 'กรุณาระบุ officer_id' });
  }

  // คำสั่ง SQL สำหรับลบข้อมูลเจ้าหน้าที่ที่มี officer_id ตรงกับที่ส่งมา
  const deleteQuery = 'DELETE FROM officer WHERE officer_id = ?';

  // ลบข้อมูลจากฐานข้อมูล
  connection.query(deleteQuery, [officer_id], (err, result) => {
    if (err) {
      console.error('Error deleting officer:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูลเจ้าหน้าที่' });
    }

    // ตรวจสอบว่ามีการลบแถวข้อมูลหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบเจ้าหน้าที่ที่มี officer_id นี้ในระบบ' });
    }

    // ส่งข้อความตอบกลับเมื่อทำการลบข้อมูลสำเร็จ
    res.status(200).json({
      message: `ข้อมูลเจ้าหน้าที่ถูกลบเรียบร้อยแล้ว`
    });
  });
});



// API : ดูรายการที่ admin เคยทำ
app.get('/manageByAdmin', (req, res) => {
  const query = `
    SELECT 
      b.borrow_id,
      b.request_date,
      b.borrow_date,
      b.status AS borrow_status,
      b.document,
      b.officer_borrow,
      b.officer_return,
      b.laptop_tag,
      sd.stu_id,
      sd.stu_idcard,
      sd.stu_fname,
      sd.stu_lname,
      sd.stu_email,
      sd.college_years,
      f.id,
      f.faculty_engName,
      l.status AS laptop_status,  -- ดึงคอลัมน์ status จากตาราง laptop และเปลี่ยนชื่อเป็น laptop_status
      COALESCE(ob.officer_fname, '') AS officer_borrow_fname,
      COALESCE(ob.officer_lname, '') AS officer_borrow_lname,
      COALESCE(orr.officer_fname, '') AS officer_return_fname,
      COALESCE(orr.officer_lname, '') AS officer_return_lname
    FROM 
      borrow b
    JOIN 
      studentdetail sd ON b.stu_id = sd.stu_id
    LEFT JOIN 
        faculty_subject fs ON sd.stu_faculty = fs.subjectId  -- เชื่อมกับ faculty_subject สำหรับผู้ยืม
    LEFT JOIN 
        faculty f ON fs.facultyId = f.id  -- เชื่อมกับ faculty สำหรับผู้ยืม
    JOIN 
      laptop l ON b.laptop_tag = l.laptop_tag  -- เชื่อมตาราง borrow และ laptop ด้วย laptop_tag
    LEFT JOIN
      officer ob ON b.officer_borrow = ob.officer_id  -- เชื่อมตาราง officer สำหรับ officer_borrow
    LEFT JOIN
      officer orr ON b.officer_return = orr.officer_id  -- เชื่อมตาราง officer สำหรับ officer_return
    ORDER BY  
      b.borrow_id ASC;
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching borrow records:', err);
      res.status(500).send('Error fetching borrow records');
      return;
    }
    res.json(results);
  });
});


app.get('/checkBorrowStatus', async (req, res) => {
  const today = moment().startOf('day').format('YYYY-MM-DD');  // ใช้แค่วันที่ไม่มีเวลา

  try {
    // ดึงข้อมูล borrow ที่มีสถานะ 'ยืมสำเร็จ'
    const checkBorrowQuery = `SELECT borrow_id, control_id FROM borrow WHERE status = 'ยืมสำเร็จ'`;
    const borrowRecords = await new Promise((resolve, reject) => {
      connection.query(checkBorrowQuery, (err, borrowRecords) => {
        if (err) reject(err);
        resolve(borrowRecords);
      });
    });

    // ตรวจสอบว่ามีข้อมูลที่มีสถานะ 'ยืมสำเร็จ' หรือไม่
    if (borrowRecords.length > 0) {
      // ใช้ for...of loop และ async/await เพื่อตรวจสอบและอัปเดตสถานะ
      for (const borrow of borrowRecords) {
        const controlId = borrow.control_id;
        
        // ดึงข้อมูล control จาก control_request
        const getControlQuery = `SELECT end FROM control_request WHERE control_id = ? ORDER BY control_id LIMIT 1`;
        const controlResult = await new Promise((resolve, reject) => {
          connection.query(getControlQuery, [controlId], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });

        if (controlResult.length === 0) {
          console.log(`No control data found for control_id: ${controlId}`);
          continue;
        }

        const end = controlResult[0].end;
        
        // เปรียบเทียบวันที่เท่านั้น (ตัดเวลาออก)
        if (today > moment(end).format('YYYY-MM-DD')) {
          const updateStatusQuery = `UPDATE borrow SET status = 'เครื่องค้างในระบบ' WHERE borrow_id = ?`;
          await new Promise((resolve, reject) => {
            connection.query(updateStatusQuery, [borrow.borrow_id], (err) => {
              if (err) reject(err);
              resolve();
            });
          });
        }
      }
    }

    // หลังจากการอัปเดตเสร็จสิ้นแล้ว ดึงข้อมูลที่มีสถานะ 'เครื่องค้างในระบบ'
    const getUpdatedRecordsQuery = `
      SELECT b.borrow_id, b.status, b.request_date, b.borrow_date, b.return_date, sd.stu_id, sd.stu_idcard, sd.stu_fname, sd.stu_lname, sd.stu_email, f.faculty_name AS stu_faculty, f.faculty_engName AS stu_Engfaculty, laptop.laptop_tag
      FROM borrow b
      JOIN studentdetail sd ON b.stu_id = sd.stu_id
      LEFT JOIN faculty_subject fs ON sd.stu_faculty = fs.subjectId
      LEFT JOIN faculty f ON fs.facultyId = f.id
      LEFT JOIN laptop ON b.laptop_tag = laptop.laptop_tag
      WHERE b.status = 'ยืมสำเร็จ';
    `;

    // ดึงข้อมูลสถานะ 'เครื่องค้างในระบบ' จากฐานข้อมูล
    const results = await new Promise((resolve, reject) => {
      connection.query(getUpdatedRecordsQuery, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    // ส่งข้อมูลไปให้หน้าบ้าน
    res.json(results);

  } catch (err) {
    console.error('Error during process:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// API: ดึงข้อมูลคำร้องที่มีสถานะ 'เครื่องค้างในระบบ'
app.get('/statusReLate', (req, res) => {
  const query = `
  SELECT 
  b.borrow_id, 
  b.status, 
  b.request_date, 
  b.borrow_date, 
  b.return_date, 
  sd.stu_id, 
  sd.stu_idcard, 
  sd.stu_fname, 
  sd.stu_lname, 
  sd.stu_email,
  sd.stu_phone, 
  fs.subName,
  f.faculty_name AS stu_faculty, 
  f.faculty_engName AS stu_Engfaculty, 
  laptop.laptop_tag,
  laptop.barcode_id,
  COALESCE(ob.officer_fname, '') AS officer_borrow_fname,
  COALESCE(ob.officer_lname, '') AS officer_borrow_lname,
  COALESCE(orr.officer_fname, '') AS officer_return_fname,
  COALESCE(orr.officer_lname, '') AS officer_return_lname
FROM borrow b 
JOIN studentdetail sd ON b.stu_id = sd.stu_id
LEFT JOIN faculty_subject fs ON sd.stu_faculty = fs.subjectId
LEFT JOIN faculty f ON fs.facultyId = f.id
LEFT JOIN laptop ON b.laptop_tag = laptop.laptop_tag
LEFT JOIN officer ob ON b.officer_borrow = ob.officer_id  -- เชื่อมตาราง officer สำหรับ officer_borrow
LEFT JOIN officer orr ON b.officer_return = orr.officer_id  -- เชื่อมตาราง officer สำหรับ officer_return
WHERE b.status = 'เครื่องค้างในระบบ';  

  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching faculties:', err);
      res.status(500).send('Error fetching faculties');
      return;
    }
    res.json(results);
  });
});



// API : ดึงข้อมูลจากตาราง faculty ใน แก้ไขจัดการ -> ข้อมูลการยืม
app.get('/faculties', (req, res) => {
  const query = 'SELECT * FROM faculty';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching faculties:', err);
      res.status(500).send('Error fetching faculties');
      return;
    }
    res.json(results);
  });
});


//API: เพิ่มคณะและจำนวน quota ใน แก้ไขจัดการ -> ข้อมูลการยืม
app.post('/insertfacultiesQuota', (req, res) => {
  const { faculty_engName, faculty_name, number } = req.body;

  // ตรวจสอบว่าข้อมูลที่จำเป็นถูกส่งมาครบถ้วน
  if (!faculty_engName || !faculty_name || typeof number === 'undefined') {
    return res.status(400).json({ error: 'กรุณาระบุ faculty_engName, faculty_name, และ number' });
  }

  // คำสั่ง SQL เพื่อหาจำนวนที่ไม่ใช่สถานะ 'ไม่ใช้งาน' ในตาราง laptop
  const checkLaptopQuery = `
    SELECT COUNT(*) AS total FROM laptop WHERE status != 'ไม่ใช้งาน';
  `;
  
  // ตรวจสอบจำนวนในตาราง laptop ที่มีสถานะไม่ใช่ 'ไม่ใช้งาน'
  connection.query(checkLaptopQuery, (err, result) => {
    if (err) {
      console.error('Error checking laptop data:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลจากตาราง laptop' });
    }

    const totalLaptopAvailable = result[0].total || 0;

    // คำสั่ง SQL เพื่อหาผลรวมของคอลัมน์ number ในตาราง faculty
    const checkFacultyQuery = `
      SELECT SUM(number) AS totalFaculty FROM faculty;
    `;
    
    // ตรวจสอบผลรวมของคอลัมน์ number ในตาราง faculty
    connection.query(checkFacultyQuery, (err, result) => {
      if (err) {
        console.error('Error checking faculty data:', err);
        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลจากตาราง faculty' });
      }

      const totalFaculty = result[0].totalFaculty || 0;

      // คำนวณจำนวนที่เหลือ
      const remainingCapacity = totalLaptopAvailable - totalFaculty;

      // ตรวจสอบว่ามีจำนวนพอที่จะเพิ่มหรือไม่
      if (remainingCapacity < number) {
        return res.status(400).json({
          error: `จำนวนไม่พอในการเพิ่มข้อมูล! จำนวนที่เหลือในระบบ: ${remainingCapacity}`
        });
      }

      // คำสั่ง SQL สำหรับเพิ่มข้อมูล
      const insertQuery = `
        INSERT INTO faculty (faculty_engName, faculty_name, number)
        VALUES (?, ?, ?);
      `;
      
      // เพิ่มข้อมูลในฐานข้อมูล
      connection.query(insertQuery, [faculty_engName, faculty_name, number], (err, result) => {
        if (err) {
          console.error('Error inserting data into faculty:', err);
          return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลในฐานข้อมูล' });
        }

        // ส่งการตอบกลับเมื่อเพิ่มข้อมูลสำเร็จ
        res.status(201).json({
          message: 'เพิ่มข้อมูลคณะสำเร็จ',
          data: {
            faculty_engName,
            faculty_name,
            number,
          }
        });
      });
    });
  });
});



// API: ลบ quota ใน แก้ไขจัดการ -> ข้อมูลการยืม
app.delete('/deleteQuota', (req, res) => {
  const { id } = req.body;

  // ตรวจสอบว่า id ถูกส่งมาหรือไม่
  if (!id) {
    return res.status(400).json({ error: 'กรุณาระบุ id' });
  }

  // SQL สำหรับค้นหาชื่อของโควต้าตาม id
  const selectQuery = 'SELECT faculty_name FROM faculty WHERE id = ?';
  // SQL สำหรับลบโควต้าตาม id
  const deleteQuery = 'DELETE FROM faculty WHERE id = ?';

  // ดึงชื่อโควต้าก่อนทำการลบ
  connection.query(selectQuery, [id], (selectErr, selectResult) => {
    if (selectErr) {
      console.error('Error retrieving quota name:', selectErr);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหาข้อมูลโควต้า' });
    }

    // ตรวจสอบว่าเจอข้อมูลหรือไม่
    if (selectResult.length === 0) {
      return res.status(404).json({ error: 'ไม่พบโควต้านี้ในระบบ' });
    }

    const quotaName = selectResult[0].faculty_name;

    // ลบข้อมูลโควต้าจากฐานข้อมูล
    // connection.query(deleteQuery, [id], (deleteErr, deleteResult) => {
    //   if (deleteErr) {
    //     console.error('Error deleting quota:', deleteErr);
    //     return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูลโควต้า' });
    //   }

    //   // ตรวจสอบว่ามีการลบแถวข้อมูลหรือไม่
    //   if (deleteResult.affectedRows === 0) {
    //     return res.status(404).json({ error: 'ไม่พบโควต้านี้ในระบบ' });
    //   }

    //   // ส่งข้อความตอบกลับเมื่อทำการลบข้อมูลสำเร็จ
    //   res.status(200).json({
    //     message: `โควต้า "${quotaName}" ถูกลบเรียบร้อยแล้ว`
    //   });
    // });

    // ------- เพิ่ม ใหม่ -------
    connection.query(deleteQuery, [id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error('Error deleting quota:', deleteErr);
        return res.status(500).json({
          status: 'error', // เพิ่ม status เพื่อให้ฝั่งหน้าบ้านตรวจสอบได้ง่ายขึ้น
          message: 'เกิดข้อผิดพลาดในการลบข้อมูลโควต้า',
          error: deleteErr.message // ส่งรายละเอียด error ให้ฝั่งหน้าบ้าน (ควรระวังเรื่อง security ใน production)
        });
      }

      // ตรวจสอบว่ามีการลบแถวข้อมูลหรือไม่
      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({
          status: 'not_found', // เพิ่ม status
          message: 'ไม่พบโควต้านี้ในระบบ'
        });
      }

      // ส่งข้อความตอบกลับเมื่อทำการลบข้อมูลสำเร็จ
      res.status(200).json({
        status: 'success', // เพิ่ม status
        message: `โควต้า "${quotaName}" ถูกลบเรียบร้อยแล้ว`,
        deletedId: id // ส่ง id ของข้อมูลที่ถูกลบ เพื่อให้ฝั่งหน้าบ้าน update UI ได้ง่ายขึ้น
      });
    });
  });
});


// API: ส่งข้อมูลกำหนดวันเปิด-ปิดการส่งคำร้อง
app.post('/settingBorrowData', (req, res) => {
  const { start, end } = req.body;

  if (!start || !end) {
    res.status(400).json({ error: 'Start and end dates are required.' });
    return;
  }

  // ตรวจสอบข้อมูลล่าสุดในฐานข้อมูล
  const latestQuery = 'SELECT * FROM control_request ORDER BY control_id DESC LIMIT 1';

  connection.beginTransaction((err) => { // เริ่มต้น transaction
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการเริ่มต้น transaction' });
    }

    connection.query(latestQuery, (err, results) => {
      if (err) {
        return connection.rollback(() => { // rollback transaction หากมี error
          console.error('Error executing query:', err);
          return res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด' });
        });
      }

      const latestData = results[0];
      let latestEnd = null;

      try {
        latestEnd = latestData ? new Date(latestData.end) : null;
      } catch (dateError) {
        return connection.rollback(() => {
          console.error('Error parsing date:', dateError);
          return res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการแปลงวันที่' });
        });
      }

      const newStart = new Date(start);

      if (latestEnd && newStart <= latestEnd) {
        return connection.rollback(() => {
          return res.status(400).json({ status: 'error', message: 'วันที่เริ่มต้นใหม่ต้องอยู่หลังวันที่สิ้นสุดล่าสุด' });
        });
      }

      const insertQuery = 'INSERT INTO control_request (start, end) VALUES (?, ?)';

      connection.query(insertQuery, [start, end], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            console.error('Error inserting data:', err);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
          });
        }

        connection.commit((err) => { // commit transaction หากสำเร็จ
          if (err) {
            return connection.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยืนยันการทำธุรกรรม' });
            });
          }

          res.status(201).json({
            message: 'บันทึกข้อมูลสำเร็จ',
            data: { start, end}
          });
        });
      });
    });
  });
});


// API: ดึงข้อมูลวันเปิด-ปิดการส่งคำร้อง
app.get('/settingBorrowData', (req, res) => {
  const query = 'SELECT * FROM control_request ORDER BY control_id DESC LIMIT 1';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching faculties:', err);
      res.status(500).send('Error fetching faculties');
      return;
    }
    res.json(results);
  });
});


// API: แก้ไขข้อมูล SN
app.post('/editDetailNB', (req, res) => {
  const { laptop_tag, ...updateFields } = req.body;
  
  if (!laptop_tag) {
    return res.status(400).json({ error: 'Please provide laptop_tag' });
  }

  // สร้าง dynamic query
  const fields = Object.keys(updateFields);
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updateFields[field]);
  values.push(laptop_tag); // เพิ่ม laptop_tag เป็นเงื่อนไข WHERE

  const query = `UPDATE laptop SET ${setClause} WHERE laptop_tag = ?`;
  
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Error updating laptop details' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Laptop tag not found in the system' });
    }

    res.json({ message: 'Laptop details updated successfully' });
  });
});



app.get('/report', (req, res) => {
  // ✅ ดึงข้อมูลการยืมที่สะสม
  const borrowQuery = `
      SELECT DISTINCT b.stu_id, sd.stu_faculty, COALESCE(f.id, 0) AS faculty_id
      FROM borrow b
      JOIN studentdetail sd ON b.stu_id = sd.stu_id
      LEFT JOIN faculty_subject fs ON sd.stu_faculty = fs.subjectId  
      LEFT JOIN faculty f ON fs.facultyId = f.id  
      WHERE b.status IN ('ยืมสำเร็จ', 'เครื่องค้างในระบบ')
  `;

  connection.query(borrowQuery, (err, results) => {
    if (err) {
      console.error('Error fetching borrow data:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const stuIdsByFaculty = {};
    results.forEach(row => {
      const stuId = row.stu_id;
      const facultyId = row.faculty_id;

      if (!stuIdsByFaculty[facultyId]) {
        stuIdsByFaculty[facultyId] = new Set();
      }
      stuIdsByFaculty[facultyId].add(stuId);
    });

    // ✅ ดึงจำนวนเครื่องทั้งหมดที่ยังใช้งานได้
    const laptopQuery = `
      SELECT COUNT(*) AS totalAvailableLaptops 
      FROM laptop 
      WHERE status != 'ไม่ใช้งาน'
    `;

    connection.query(laptopQuery, (err, laptopResult) => {
      if (err) {
        console.error('Error fetching laptop count:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const totalFacultyMembers = laptopResult[0].totalAvailableLaptops;

      // ✅ ดึงจำนวนเครื่องสำรอง
      const reserveQuery = `
        SELECT COUNT(*) AS reserve 
        FROM laptop 
        WHERE status != 'ไม่ใช้งาน' AND brand = 'เครื่องสำรอง'
      `;

      connection.query(reserveQuery, (err, reserveResult) => {
        if (err) {
          console.error('Error fetching reserve count:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        const reserve = reserveResult[0].reserve;

        // ✅ ดึงข้อมูลคณะ
        const facultyQuery = `SELECT id, faculty_name, faculty_engName, number FROM faculty`;

        connection.query(facultyQuery, (err, facultyResults) => {
          if (err) {
            console.error('Error fetching faculty data:', err);
            return res.status(500).json({ message: 'Internal server error' });
          }

          let total = 0;
          let facultyCount = 0;
          const facultySummary = {};

          facultyResults.forEach(faculty => {
            const facultyId = faculty.id;
            const facultyKey = faculty.faculty_engName;
            const facultyName = faculty.faculty_name;
            const facultyQuota = faculty.number;
            const uniqueStuCount = stuIdsByFaculty[facultyId] ? stuIdsByFaculty[facultyId].size : 0;

            if (uniqueStuCount > 0) {
              facultyCount++;
            }

            facultySummary[facultyKey] = {
              name: facultyName,
              borrowed: uniqueStuCount,
              quota: facultyQuota
            };
            total += uniqueStuCount;
          });

          // ✅ remaining จะสะสมไปเรื่อยๆ (ไม่รีเซ็ตทุกเดือน)
          const remainingQuery = `
            SELECT COUNT(*) AS remainingLaptops
            FROM laptop
            WHERE status = 'ใช้งานได้' OR status = 'เครื่องค้างในระบบ'
          `;

          connection.query(remainingQuery, (err, remainingResult) => {
            if (err) {
              console.error('Error fetching remaining laptops:', err);
              return res.status(500).json({ message: 'Internal server error' });
            }

            const remainingLaptops = remainingResult[0].remainingLaptops;

            res.json({
              total: total,  
              availableLaptops: totalFacultyMembers,  
              reserve: reserve,
              remaining: remainingLaptops,  
              facultySummary: facultySummary,
              facultyCount: facultyCount,
            });
          });
        });
      });
    });
  });
});



// API: ลบคำร้องของการยืมในหน้าแรกของนศ.
app.delete('/deleteRequestStudent', (req, res) => {
  const { borrow_id } = req.body; // Expect borrow_id in request body

  if (!borrow_id) {
    return res.status(400).json({ message: 'Missing borrow_id in request body.' });
  }

  // Query to check the status of the borrow entry
  connection.query('SELECT status FROM borrow WHERE borrow_id = ?', [borrow_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error querying database.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Borrow request not found.' });
    }

    const borrow = results[0];
    const validStatuses = ['รอรับเครื่อง', 'รอตรวจสอบ'];

    // Check if the status allows deletion
    if (!validStatuses.includes(borrow.status)) {
      return res.status(400).json({ message: 'Cannot delete borrow request with the current status.' });
    }

    connection.query('DELETE FROM borrow WHERE borrow_id = ?', [borrow_id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error(deleteErr);
        return res.status(500).json({
          status: 'error', // เพิ่ม status เพื่อให้ frontend แยกแยะได้
          message: 'เกิดข้อผิดพลาดในการลบคำขอ' // ข้อความที่สื่อความหมาย
        });
      }

      if (deleteResult.affectedRows > 0) {
        res.status(200).json({
          status: 'success', // เพิ่ม status
          message: 'ลบคำขอสำเร็จ' // ข้อความที่สื่อความหมาย
        });
      } else {
        res.status(404).json({
          status: 'error', // เพิ่ม status และเปลี่ยนเป็น error เนื่องจากไม่พบข้อมูล
          message: 'ไม่พบคำขอ' // ข้อความที่สื่อความหมาย
        });
      }
    });
  });
});


/**************************************************************************************************** */

const uploadReport = multer({ storage: storageReport });

app.post("/uploadReport", uploadReport.single("file"), async (req, res) => {
  if (!req.file) return res.json({ success: false, message: "ไม่มีไฟล์" });

  const filePath = `/reports/${req.file.filename}`;
  const fileName = req.file.filename;
  const reportDate = new Date().toISOString().split("T")[0]; // วันที่ปัจจุบัน YYYY-MM-DD

  try {

    const insertQuery = 'INSERT INTO report (fileName, reportDate, filepath) VALUES (?, ?, ?)';
    connection.query(insertQuery, [fileName, reportDate, filePath], (err, result) => {
      if (err) {
        return connection.rollback(() => {
          console.error('Error inserting data:', err);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
        });
      }

    res.json({ success: true, filepath: filePath });
  });
  } catch (error) {
    console.error("❌ DB Error:", error);
    res.json({ success: false, message: "DB Error" });
  }
});

app.get('/reportFile', (req, res) => {
  const query = `
    SELECT * FROM report
    WHERE id IN (
      SELECT MAX(id) FROM report
      GROUP BY fileName
    )
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching report files:', err);
      res.status(500).send('Error fetching report files');
      return;
    }
    res.json(results);
  });
});


// เสิร์ฟไฟล์ที่อัปโหลดให้ดาวน์โหลด
app.get("/downloadReport/:fileName", (req, res) => {
  const filePath = path.join(__dirname, "/reports", req.params.fileName);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

// ************************************************************************************** //

const uploadReportReturnLate = multer({ storage: storageReLate });

app.post("/uploadReportReLate", uploadReportReturnLate.single("file"), async (req, res) => {
  if (!req.file) return res.json({ success: false, message: "ไม่มีไฟล์" });

  const filePath = `/reports_return_late/${req.file.filename}`;
  const fileName = req.file.filename;
  const reportDate = new Date().toISOString().split("T")[0]; // วันที่ปัจจุบัน YYYY-MM-DD

  try {

    const insertQuery = 'INSERT INTO report_return_late (fileName, reportDate, filepath) VALUES (?, ?, ?)';
    connection.query(insertQuery, [fileName, reportDate, filePath], (err, result) => {
      if (err) {
        return connection.rollback(() => {
          console.error('Error inserting data:', err);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
        });
      }

    res.json({ success: true, filepath: filePath });
  });
  } catch (error) {
    console.error("❌ DB Error:", error);
    res.json({ success: false, message: "DB Error" });
  }
});

app.get('/reportFileReLate', (req, res) => {
  const query = `
    SELECT * FROM report_return_late
WHERE id IN (
  SELECT MAX(id) FROM report_return_late
  GROUP BY fileName
);

    
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching report files:', err);
      res.status(500).send('Error fetching report files');
      return;
    }
    res.json(results);
  });
});


// เสิร์ฟไฟล์ที่อัปโหลดให้ดาวน์โหลด
app.get("/downloadReportReLate/:fileName", (req, res) => {
  const filePath = path.join(__dirname, "reports_return_late", req.params.fileName);
  console.log("File path:", filePath); // เพิ่มการแสดงเส้นทางไฟล์ในคอนโซล
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(fileUpload()); // ✅ เปิดใช้ express-fileupload
app.use('/reports', express.static(path.join(__dirname, 'reports'))); // ✅ ทำให้ไฟล์ PDF สามารถเข้าถึงได้จาก frontend
app.use('/reports_Return_Late', express.static(path.join(__dirname, 'reports_Return_Late'))); // ✅ ทำให้ไฟล์ PDF สามารถเข้าถึงได้จาก frontend


