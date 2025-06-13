import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPen, faCalendar, faChevronDown, faChartSimple } from '@fortawesome/free-solid-svg-icons';

function Slidebaradmin() {
    const [open, setOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const [showPinPopup, setShowPinPopup] = useState(false);
    const [pin, setPin] = useState("");
    const [email, setEmail] = useState("");
    const [selectedLink, setSelectedLink] = useState(null);
    //const { officer_email  } = useParams(); // ดึง officer_email จาก URL
    const [selectedMenu, setSelectedMenu] = useState(location.pathname); // ใช้ path ปัจจุบันเป็นค่าเริ่มต้น


    const Menus = [
        { title: "รอตรวจสอบ", icon: faHome, link: "/ApproveRequest" },
        { title: "รอรับเครื่อง", icon: faCalendar, link: "/admin/notebookWaiting" },
        { title: "ยืมโน้ตบุ๊ก", icon: faCalendar, link: "/admin/notebookborrowing" },
        { title: "คืนโน้ตบุ๊ก", icon: faCalendar, link: "/admin/notebookreturn" },
        { title: "ค้างส่งโน้ตบุ๊ก", icon: faCalendar, link: "/admin/PageReturnLate" },
        { title: "สรุปข้อมูล", icon: faChartSimple, link: "/admin/Dashboad" },
        {
            title: "แก้ไข/จัดการ",
            icon: faPen,
            link: "#",
            dropdown: [
                { title: "ข้อมูลการยืม", link: "/admin/EditForm" },
                { title: "ข้อมูลโน้ตบุ๊ก", link: "/admin/Allnotebook" },
                { title: "ข้อมูลเจ้าหน้าที่", link: "/admin/OfficerList" }
            ],
        },
    ];

    const handleProtectedClick = (link) => {
        console.log("เปิดป๊อปอัพ PIN สำหรับ:", link);
        setSelectedLink(link);
        setShowPinPopup(true);
    };

    const handlePinSubmit = async () => {
        // console.log("PIN ที่ส่งไป:", pin);  // ตรวจสอบค่าของ PIN
        // console.log("อีเมลที่ส่งไป:", email);  // ตรวจสอบค่าของ email

        try {
            const response = await fetch("http://localhost:5002/checkPin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin, email })  // ส่ง PIN และ officer_email ไปให้หลังบ้าน
            });

            const data = await response.json();

            //console.log("Response จาก server:", data);  // ตรวจสอบข้อมูลที่ตอบกลับจากเซิร์ฟเวอร์

            if (data.success) {
                console.log("✅ รหัสผ่านถูกต้อง, นำทางไปยัง:", selectedLink);
                navigate(selectedLink);
            } else {
                alert("❌ รหัสผ่านไม่ถูกต้อง");
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาด:", error);
            alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่");
        } finally {
            //setEmail("");
            setPin(""); // ล้างค่า PIN
            setShowPinPopup(false);  // ปิดป๊อปอัพ
        }
    };


    return (
        <div className="flex">
            {/* Sidebar */}
            <div className={`${open ? "w-52" : "w-14"} bg-blue2 min-h-screen h-full p-5 pt-8 relative duration-300 z-20 fixed`}>
                {/* Logo */}
                <div className="flex gap-x-4 items-center">
                    <img src="/logo2.png" className={`duration-200 ${open && "opacity-100"} ${!open && "opacity-0"} w-100 h-16`} alt="ADMIN Text" />
                </div>

                {/* Sidebar Menu */}
                <ul className="pt-6 space-y-4">
                    {Menus.map((Menu, index) => (
                        <li key={index} className="relative group">
                            <div
                                onClick={() => {
                                    if (!Menu.dropdown) {
                                        setSelectedMenu(Menu.link);
                                        navigate(Menu.link);
                                    }
                                }}
                                className={`flex rounded-md p-2 cursor-pointer hover:bg-blue-700 text-white text-sm items-center gap-x-4 
                                    ${selectedMenu === Menu.link ? "border border-white bg-blue-600" : ""}`}
                            >
                                <FontAwesomeIcon icon={Menu.icon} className="text-lg" />
                                <span className={`${!open && "hidden"} origin-left duration-200`}>
                                    {Menu.title}
                                </span>
                            </div>


                            {/* Dropdown Menu */}
                            {Menu.dropdown && (
                                <ul className="pl-8 space-y-2 absolute left-0 top-full w-full bg-blue-100 mt-2 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:max-h-40 max-h-0 overflow-hidden z-10">
                                    {Menu.dropdown.map((item, subIndex) => (
                                        <li key={subIndex} className="flex rounded-md p-2 hover:bg-light-white text-gray-300 text-sm">
                                            <button onClick={() => handleProtectedClick(item.link)} className="w-full text-left">
                                                {item.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Password Popup */}
            {showPinPopup && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-xl font-semibold mb-4">🔐 กรุณากรอกข้อมูล</h2>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}  // อัพเดตค่า Email ใน state
                            className="border p-2 rounded w-full mb-4"
                            placeholder="กรอกอีเมล"
                        />
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}  // อัพเดตค่า PIN ใน state
                            className="border p-2 rounded w-full mb-4"
                            placeholder="กรอกรหัสผ่าน"
                        />
                        <div className="flex justify-between">
                            <button onClick={handlePinSubmit} className="bg-blue text-white px-4 py-2 rounded">ยืนยัน</button>
                            <button onClick={() => setShowPinPopup(false)} className="bg-red-500 text-white px-4 py-2 rounded">ยกเลิก</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Optional main content area */}
            <div className="flex-grow">
                {/* Your main content goes here */}
            </div>
        </div>
    );
}

export default Slidebaradmin;





