import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function DashboadFilemonth({ reportRef }) {
  const [filesReport, setFilesReport] = useState([]);
  const [filesReLate, setFilesReLate] = useState([]);
  const [reportData, setReportData] = useState([]); // เพิ่มการใช้ state สำหรับ reportData
  const [lateReturnsData, setLateReturnsData ] = useState([]);
  const [facultySummaryData, setFacultySummaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: "", color: "" });

  // ดึงข้อมูลจาก API เมื่อ component ถูก mount
  useEffect(() => {
    // ดึงข้อมูลจาก API แรก
    fetch('http://localhost:5002/report')
      .then((response) => {
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลรายงาน');
        }
        return response.json();
      })
      .then((data) => {
        // ตรวจสอบว่า data เป็น object หรือไม่
        if (data && typeof data === 'object') {
          // แปลงข้อมูลจาก object เป็น array ของข้อมูลที่ต้องการ
          const transformedData = [
            {
              index: 1,  // สมมุติว่าแค่ 1 แถวในข้อมูลนี้
              total: data.total,
              totalFacultyMembers: data.totalFacultyMembers,
              reserve: data.reserve,
              remaining: data.remaining,
              facultyCount: data.facultyCount
            }
          ];
  
          const facultySummaryData = Object.keys(data.facultySummary).map((faculty) => ({
            faculty: faculty, // ใช้รหัสคณะ (เช่น "ED")
            name: data.facultySummary[faculty].name, // เพิ่มชื่อคณะเต็ม
            borrows: data.facultySummary[faculty].borrowed,
            quota: data.facultySummary[faculty].quota
          }));
          
  
          // เก็บข้อมูลที่แปลงแล้วลงใน state
          setReportData(transformedData);
          setFacultySummaryData(facultySummaryData);  // เพิ่มการตั้งค่า state สำหรับ facultySummary
        } else {
          console.warn("ข้อมูลรายงานไม่พบ");
          setStatus({ text: "ข้อมูลรายงานไม่พบ", color: "red" });
        }
      })
      .catch((error) => {
        console.error('Error fetching report data:', error);
        setStatus({ text: "เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน", color: "red" });
      });
  
    // ดึงข้อมูลจาก API ที่สอง (/returnLate)
    fetch('http://localhost:5002/statusReLate')
      .then((response) => {
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลรายงานการคืนเครื่อง');
        }
        return response.json();
      })
      .then((item) => {
        // ตรวจสอบว่า data เป็น object หรือไม่
        if (item && typeof item === 'object') {
          // แปลงข้อมูลจาก object เป็น array ของข้อมูลที่ต้องการ
          const transformedLateData = Object.values(item).map((item) => ({
            borrow_id: item.borrow_id,
            request_date: item.request_date,
            borrow_date: item.borrow_date,
            return_date: item.return_date,
            status: item.status,
            document: item.document,
            borrower_officer: item.officer_borrow_fname && item.officer_borrow_lname 
    ? `${item.officer_borrow_fname} ${item.officer_borrow_lname}` 
    : "-",
  return_officer: item.officer_return_fname && item.officer_return_lname 
    ? `${item.officer_return_fname} ${item.officer_return_lname}` 
    : "-",
            stu_id: item.stu_id,
            stu_idcard: item.stu_idcard,
            stu_fname: item.stu_fname,
            stu_lname: item.stu_lname,
            stu_email: item.stu_email,
            stu_faculty: item.stu_faculty,
            stu_Engfaculty: item.stu_Engfaculty,
            subName: item.subName,
            stu_phone: item.stu_phone,
            laptop_tag: item.laptop_tag,
            barcode_id: item.barcode_id
          }));

          // เก็บข้อมูลที่แปลงแล้วลงใน state
          setLateReturnsData(transformedLateData);  // เพิ่มการตั้งค่า state สำหรับข้อมูลการคืนเครื่องช้า
          //console.log(transformedLateData);
        } else {
          console.warn("ข้อมูลการคืนเครื่องช้าไม่พบ");
          setStatus({ text: "ข้อมูลการคืนเครื่องช้าไม่พบ", color: "red" });
        }
      })
      .catch((error) => {
        console.error('Error fetching returnLate data:', error);
        setStatus({ text: "เกิดข้อผิดพลาดในการโหลดข้อมูลการคืนเครื่อง", color: "red" });
      });


      fetch('http://localhost:5002/reportFile')
      .then((response) => response.json())
      .then((data) => setFilesReport(data))
      .catch((error) => console.error('Error fetching files:', error));

      fetch('http://localhost:5002/reportFileReLate')
      .then((response) => response.json())
      .then((data) => setFilesReLate(data))
      .catch((error) => console.error('Error fetching files:', error));

}, []);
  

const onDownload = (fileName) => {
  fetch(`http://localhost:5002/downloadReport/${fileName}`)
    .then((response) => {
      if (response.ok) {
        // ถ้าการดาวน์โหลดสำเร็จ จะเริ่มดาวน์โหลดไฟล์
        return response.blob(); // สร้าง Blob สำหรับไฟล์
      } else {
        throw new Error('ไม่สามารถดาวน์โหลดไฟล์ได้');
      }
    })
    .then((blob) => {
      // สร้าง URL สำหรับไฟล์ที่ดาวน์โหลด
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName; // ตั้งชื่อไฟล์ที่ดาวน์โหลด
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url); // เคลียร์ URL หลังจากดาวน์โหลดเสร็จ
    
      
      setTimeout(() => {
        window.location.reload();
      }, 1000); // ตั้งค่า delay 1 วินาที เพื่อให้มั่นใจว่าดาวน์โหลดเสร็จก่อนรีโหลด
    })
    .catch((error) => console.error('Error fetching files:', error));
};

  const loadFont = async () => {
    try {
      const response = await fetch("/fonts/THSarabunNew.ttf");
      if (!response.ok) throw new Error("ไม่สามารถโหลดไฟล์ฟอนต์");
      const fontData = await response.arrayBuffer();
      return btoa(
        new Uint8Array(fontData).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
    } catch (error) {
      console.error("❌ Error loading font:", error);
      return null;
    }
  };

  const loadBoldFont = async () => {
    try {
      const response = await fetch('/fonts/THSarabunNew-Bold.ttf');
      const fontData = await response.arrayBuffer();
      const base64Font = btoa(
        new Uint8Array(fontData).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      return base64Font;
    } catch (error) {
      console.error("❌ Error loading bold font:", error);
      return null;
    }
  };

  const formatThaiDate = (dateString) => {
    const date = new Date(dateString);
    const thaiYear = date.getFullYear() + 543;
    const month = date.toLocaleString("th-TH", { month: "long" });
    const day = date.getDate();
    return `${day} ${month} ${thaiYear}`;

  };

  function formatThaiDateTime(dateString) {
      const date = new Date(dateString);
    
      // คำนวณปี พ.ศ.
      const thaiYear = date.getFullYear() + 543;
    
      // หาค่าของวันที่, เดือน, ชั่วโมง, นาที, วินาที
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');  // เดือนเริ่มจาก 0
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
    
      // แปลงวันที่เป็นรูปแบบ 24-3-2568 16:55:50
      return `${day}-${month}-${thaiYear} ${hours}:${minutes}:${seconds}`;
    }
  
  const uploadPDFToServer = async (pdfBlob, fileName) => {
    const formData = new FormData();
    formData.append("file", pdfBlob, fileName);
  
    try {
      const response = await fetch("http://localhost:5002/uploadReport", {
        method: "POST",
        body: formData
      });
  
      const result = await response.json();
      if (result.success) {
        console.log("✅ อัปโหลดสำเร็จ:", result.filepath);
      } else {
        console.error("❌ อัปโหลดล้มเหลว");
      }
    } catch (error) {
      console.error("❌ Error uploading PDF:", error);
    }
  };

  const uploadPDFReLateToServer = async (pdfBlob, fileName) => {
    const formData = new FormData();
    formData.append("file", pdfBlob, fileName);
  
    try {
      const response = await fetch("http://localhost:5002/uploadReportReLate", {
        method: "POST",
        body: formData
      });
  
      const result = await response.json();
      if (result.success) {
        console.log("✅ อัปโหลดสำเร็จ:", result.filepath);
      } else {
        console.error("❌ อัปโหลดล้มเหลว");
      }
    } catch (error) {
      console.error("❌ Error uploading PDF:", error);
    }
  };

  const createAndSavePDF = async () => {
    if (loading) return;
    setLoading(true);
    setStatus({ text: "กำลังตรวจสอบไฟล์...", color: "white" , fontSize: 8});
  
    try {
      const now = new Date();
      const thaiYear = now.getFullYear() + 543;
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const monthName = `${thaiYear}_${month}`;
      let fileName = `Report_${monthName}.pdf`;       
      const pdf = new jsPDF('p', 'mm', 'a4');
      const fontBase64 = await loadFont();
      const boldFontBase64 = await loadBoldFont();
  
      if (!fontBase64 || !boldFontBase64) throw new Error("ไม่สามารถโหลดฟอนต์ได้");
  
      // Add regular and bold fonts
      pdf.addFileToVFS("THSarabunNew.ttf", fontBase64);
      pdf.addFileToVFS("THSarabunNew-Bold.ttf", boldFontBase64);
      pdf.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
      pdf.addFont("THSarabunNew-Bold.ttf", "THSarabunNew", "bold");
  
      // Set Thai font with explicit encoding
      //pdf.setFont("THSarabunNew", "normal");
      pdf.setFontSize(16);
  
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
  

    // ตั้งค่าฟอนต์ให้เป็น THSarabunNew และตัวหนา
    pdf.setFont("THSarabunNew", "bold");

    const title1 = `รายงานสรุปข้อมูลจำนวนเครื่องที่ถูกยืม`;
    const title2 = `ประจำเดือน ${formatThaiDate(now)}`;

    pdf.text(title1, pageWidth / 2, 25, {
      align: 'center'
    });

    pdf.text(title2, pageWidth / 2, 35, {
      align: 'center',
      textColor: [0, 0, 0]
    });


    // สร้างตารางหลัก
    const tableColumn = ["รายการ", "โน้ตบุ๊กที่ถูกยืมไป", "โน้ตบุ๊กที่เหลือ", "โน้ตบุ๊กสำรอง", "จำนวนคณะที่ยืม"];
    const tableRows = reportData.map((item, index) => [
      { content: "จำนวน", styles: { fontStyle: "bold", textColor: [255, 255, 255], fillColor: [0, 112, 192] } }, // ทำให้ "จำนวน" เป็นตัวหนา
      item.total,
      item.remaining,
      item.reserve,
      item.facultyCount
    ]);

    // เพิ่มชื่อของตาราง
    pdf.text("ตารางข้อมูลการยืม", 20, 45, {
      align: 'left',
      lang: 'th',
      fontStyle: 'bold' // หัวเรื่องหนา
    });

    // สร้างตาราง
    autoTable(pdf, {
      startY: 55, 
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        font: "THSarabunNew",
        fontSize: 14,
        cellPadding: 1,
        halign: 'center'
      },
      headStyles: {
        fillColor: [255, 255, 255], // หัวตารางสีเทาอ่อน
        textColor: [0, 0, 0],  // สีตัวอักษรในหัวตารางเป็นสีดำ
        fontStyle: "normal",
        halign: 'center',
        lineWidth: 0.25
      },
      bodyStyles: {
        textColor: [0, 0, 0], // กำหนดให้ข้อความของแถวข้อมูลเป็นสีดำ
      },
      columnStyles: {
        0: { fillColor: [0, 112, 192], textColor: [255, 255, 255]}, // คอลัมน์ "รายการ" เป็นสีน้ำเงิน และตัวอักษรสีขาว
      },
      didParseCell: function (data) {
        // เปลี่ยนสีพื้นหลังของหัวข้อ 'รายการ' เป็นสีน้ำเงิน และตัวอักษรเป็นสีขาว
        if (data.section === 'head' && data.column.index === 0) {
          data.cell.styles.fillColor = [0, 112, 192];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }

        // เปลี่ยนสีพื้นหลังของแถวข้อมูลคอลัมน์แรก (จำนวน) เป็นสีน้ำเงิน
        if (data.section === 'body' && data.column.index === 0) {
          data.cell.styles.fillColor = [0, 112, 192];
          data.cell.styles.textColor = [255, 255, 255];
        }
      },
      margin: { 
        top: 20,
        left: (pdf.internal.pageSize.width - 150) / 2 
      }
    });






    
    // สร้างตาราง facultySummary แยกต่างหาก
    const facultySummaryColumns = ["คณะ", "โควต้า", "จำนวนที่ยืม"];
    const facultySummaryRows = facultySummaryData.map((item) => [
      item.name,  // คณะ
      item.quota,    // จำนวนที่ยืม
      item.borrows   // โควต้า
    ]);

    
    // เพิ่มชื่อของตารางที่สอง
    pdf.text("ตารางข้อมูลจำนวนการยืมของแต่ละคณะ", 40 / 2, pdf.lastAutoTable.finalY + 15, {
      align: "left",
      lang: "th",
      fontStyle: 'bold' // ตัวหนา
    });

    // สร้างตาราง facultySummary
    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 25,  // เริ่มตารางใหม่หลังจากตารางแรก
      head: [facultySummaryColumns],
      body: facultySummaryRows,
      theme: "grid",
      styles: {
        font: "THSarabunNew",
        fontSize: 14,
        cellPadding: 1,
        halign: 'center'
      },
      headStyles: {
        fillColor: [0, 112, 192],
        textColor: [255, 255, 255],
        font: "THSarabunNew",
        fontStyle: "bold",
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        0: { cellWidth: 50 },    // คอลัมน์ที่ 1 (คณะ)
        1: { cellWidth: 20 },    // คอลัมน์ที่ 2 (โควต้า)
        2: { cellWidth: 20 },    // คอลัมน์ที่ 3 (จำนวนที่ยืม)
      },
      margin: { 
        top: 20,
        left: (pdf.internal.pageSize.width - 90) / 2 
      }
    });

    pdf.save(fileName);
    setStatus({ text: "✅ บันทึก PDF สำเร็จ!", color: "green", fontSize: 8});

    const pdfBlob = pdf.output("blob");
    await uploadPDFToServer(pdfBlob, fileName, monthName);


  } catch (error) {
    console.error("❌ Error creating PDF:", error);
    setStatus({ text: "❌ สร้าง PDF ไม่สำเร็จ", color: "red" });
  } finally {
    setLoading(false);
  }
  };


  const onDownloadReLate = async (fileName) => {
    fetch(`http://localhost:5002/downloadReportReLate/${fileName}`)
      .then((response) => {
        if (response.ok) {
          return response.blob();  // ถ้าการดาวน์โหลดสำเร็จ
        } else {
          throw new Error('ไม่สามารถดาวน์โหลดไฟล์ได้');
        }
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;  // ใช้ fileName ที่ดาวน์โหลด
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);  // เคลียร์ URL
      })
      .catch((error) => console.error('Error fetching files:', error));
};

  
  const generateSecondPdf2 = async () => {
    if (loading) return;
    setLoading(true);
    setStatus({ text: "กำลังตรวจสอบไฟล์...", color: "white" });
  
    try {
      const now = new Date();
      const thaiYear = now.getFullYear() + 543;
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const monthName = `${thaiYear}_${month}`;
      let fileName2 = `Return_Late_${monthName}.pdf`;
  
      
  
      const pdf = new jsPDF('l', 'mm', 'a4');
      const fontBase64 = await loadFont();
      const boldFontBase64 = await loadBoldFont();
  
      if (!fontBase64 || !boldFontBase64) throw new Error("ไม่สามารถโหลดฟอนต์ได้");
  
      // Add regular and bold fonts
      pdf.addFileToVFS("THSarabunNew.ttf", fontBase64);
      pdf.addFileToVFS("THSarabunNew-Bold.ttf", boldFontBase64);
      pdf.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
      pdf.addFont("THSarabunNew-Bold.ttf", "THSarabunNew", "bold");
  
      // Set Thai font with explicit encoding
      pdf.setFont("THSarabunNew", "normal");
      pdf.setFontSize(16);
  
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
  
    pdf.setFont("THSarabunNew", "bold");
    // คำนวณความกว้างข้อความ
    pdf.setFontSize(14);  // กำหนดขนาดตัวอักษรเป็น 16
    const title5 = `รายงานข้อมูลการคืนเครื่องที่ล่าช้า`;
    const title6 = `ประจำเดือน ${formatThaiDate(now)}`;

    // จัดข้อความให้อยู่ตรงกลาง
    pdf.text(title5, pageWidth / 2, 25, {
      align: 'center',
      lang: 'th'
    });
    pdf.text(title6, pageWidth / 2, 31, {
      align: 'center',
      lang: 'th'
    });

    // สร้างตารางหลัก
    const tableColumn = ["ลำดับ","วันที่รับเครื่อง", "วันที่คืนเครื่อง","เลขบัตรประชาชน", "รหัสนักศึกษา", 
      "ชื่อ-สกุล", "คณะ","สาขา", "เบอร์โทร", "เลขเครื่อง", "บาร์โค้ด", "เจ้าหน้าที่ให้เครื่อง", "เจ้าหน้าที่รับเครื่อง"];
      const tableRows = lateReturnsData.map((item, index) => [
        index + 1,             // เพิ่ม 1 เพื่อเริ่มลำดับจาก 1
        formatThaiDateTime(item.borrow_date),  // แปลงวันที่ยืม
        formatThaiDateTime(item.return_date),  // แปลงวันที่คืน
        item.stu_idcard,       // เลขบัตรประชาชน
        item.stu_id,           // รหัสนักศึกษา
        `${item.stu_fname} ${item.stu_lname}`,  // ชื่อ-สกุล
        item.stu_faculty,      // คณะ
        item.subName,
        item.stu_phone,        // เบอร์โทร
        item.laptop_tag,       // เลขเครื่อง
        item.barcode_id,       // บาร์โค้ด
        item.borrower_officer,
        item.return_officer
      ]);
      
      // ตรวจสอบว่า tableRows มีข้อมูลหรือไม่
     // console.log(tableRows);

    // เพิ่มชื่อของตารางแรก
    pdf.text("ตารางรายชื่อนักศึกษาคืนเครื่องล่าช้า", 17, 45, { // 20 คือระยะห่างจากขอบซ้าย
      align: 'left',
      lang: 'th',
      fontStyle: 'bold' // ตัวหนา
    });

    // สร้างตารางหลัก
    autoTable(pdf, {
      startY: 53, // เริ่มวาดตารางที่ตำแหน่ง Y = 55 หลังจากชื่อตาราง
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        font: "THSarabunNew",
        fontSize: 10,
        cellPadding: 1,
        halign: 'center' // ตั้งค่าการจัดตำแหน่งข้อความให้ตรงกลางทั้งในคอลัมน์และแถว
      },
      headStyles: {
        fillColor: [0, 112, 192],
        textColor: [255, 255, 255],
        font: "THSarabunNew",
        fontStyle: "bold",
        halign: 'center' // ตั้งค่าการจัดตำแหน่งข้อความให้ตรงกลางทั้งในคอลัมน์และแถว
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        0: { cellWidth: 8 },    
        1: { cellWidth: 16 },    
        2: { cellWidth: 16 },    
        3: { cellWidth: 20 },    
        4: { cellWidth: 18 },    
        5: { cellWidth: 28 },    
        6: { cellWidth: 28 },    
        7: { cellWidth: 28 }, 
        8: { cellWidth: 15 }, //   
        9: { cellWidth: 17 },    
        10: { cellWidth: 20 },    
        11: { cellWidth: 25 },    
        12: { cellWidth: 25 },    
       
      },
      margin: { 
        top: 15,
        left: (pdf.internal.pageSize.width - 264) / 2 
      }
    });

   
    pdf.save(fileName2);
    setStatus({ text: "✅ บันทึก PDF สำเร็จ!", color: "green", fontSize: 8});

    const pdfBlob = pdf.output("blob");
    await uploadPDFReLateToServer(pdfBlob, fileName2, monthName);

  } catch (error) {
    console.error("❌ Error creating PDF:", error);
    setStatus({ text: "❌ สร้าง PDF ไม่สำเร็จ", color: "red" });
  } finally {
    setLoading(false);
  }
  };

  
  

  return (
    <div className="w-[15rem] h-[30rem] bg-blue2 p-4 rounded-lg border border-gray-200 flex flex-col mr-4 shadow-lg">
      <strong className="text-white font-sans">เอกสารสรุปข้อมูล </strong>
      <button
        onClick={createAndSavePDF}
        disabled={loading}
        className="mt-3 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'กำลังสร้าง PDF...' : 'Report เเต่ละเดือน'}
      </button>
      

      {status.text && (
        <p style={{ color: status.color }} className="mt-1 text-gray-700">
          {status.text}
        </p>
      )}

      <div className=" w-full flex-1 text-xs overflow-y-auto">
        <ul className="list-none p-0 m-0">
          {filesReport.length > 0 ? (
            filesReport.map((file) => (
              <li key={file.id} className="py-1 border-b border-gray-300 last:border-b-0 text-white leading-6 flex justify-between items-center">
                <span>{file.fileName}</span> 
                <button
                  onClick={() => onDownload(file.fileName)}  
                  className="text-blue-300 hover:text-blue-500"
                >
                  ดาวน์โหลด
                </button>
              </li>
            ))
          ) : (
            <li className="text-white">ไม่มีไฟล์รายงาน</li>
          )}
        </ul>
      </div>



      <button
        onClick={generateSecondPdf2}
        disabled={loading}
        className=" px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'กำลังสร้าง PDF...' : 'Report เครื่องค้างส่ง'}
      </button>
      {status.text && (
        <p style={{ color: status.color }} className="mt-2 text-gray-700">
          {status.text}
        </p>
      )}
      <div className=" w-full flex-1 text-xs overflow-y-auto">
        <ul className="list-none p-0 m-0">
          {filesReLate.length > 0 ? (
            filesReLate.map((file) => (
              <li key={file.id} className="py-1 border-b border-gray-300 last:border-b-0 text-white leading-6 flex justify-between items-center">
                <span>{file.fileName}</span> 
                <button
                  onClick={() => onDownloadReLate(file.fileName)}  // แก้เป็น file.fileName
                  className="text-blue-300 hover:text-blue-500"
                >
                  ดาวน์โหลด
                </button>

              </li>
            ))
          ) : (
            <li className="text-white">ไม่มีไฟล์รายงาน</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default DashboadFilemonth;