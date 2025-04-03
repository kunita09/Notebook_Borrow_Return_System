import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPen, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';

function Slidebar() {
  const [open, setOpen] = useState(true);
  const location = useLocation(); // ใช้ location เพื่อเช็คเส้นทางปัจจุบัน

  const Menus = [
    { title: "หน้าแรก", icon: faHome, link: "/StuHome" },
    { title: "ส่งคำร้องขอยืม", icon: faPen, link: "/Form" },
    { title: "ประวัติขอยืม", icon: faUser, gap: true, link: "/ReqHistory" },
    // { title: "ติดต่อ", icon: faCalendar, link: "#" },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`${open ? "w-72" : "w-20"} bg-blue2 min-h-screen h-full p-5 pt-8 relative duration-300 z-20 fixed`}
      >
        <img
          src="/control.png"  // Corrected path, assuming control.png is in the public folder
          className={`absolute cursor-pointer -right-3 top-9 w-7 border-blue2
           border-2 rounded-full ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}
        />
        <div className="flex gap-x-4 items-center">
          <img
            src="/logo1.png"  // Corrected path, assuming logo1.png is in the public folder
            className={`cursor-pointer duration-500 ${open && "rotate-[360deg]"}`}
            alt="Logo 1"
          />
          <img
            src="/logo2.png"  // Corrected path, assuming logo2.png is in the public folder
            className={`duration-200 ${open && "opacity-100"} ${!open && "opacity-0"} w-100 h-16`} // ใช้ opacity แทน scale-0
            alt="Designer Text"
          />
        </div>
        {/* Sidebar Menu */}
        <ul className="pt-6 space-y-4">
          {Menus.map((Menu, index) => (
            <li
              key={index}
              className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
              ${Menu.gap ? "mt-9" : ""} 
              ${location.pathname === Menu.link ? "bg-light-white text-blue-500" : ""}`}
            >
              <Link to={Menu.link} className="flex items-center gap-x-4  w-full">
                <FontAwesomeIcon icon={Menu.icon} className="text-lg" />
                <span className={`${!open && "hidden"} origin-left duration-200`}>
                  {Menu.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Optional main content area */}
      <div className="flex-grow">
        {/* Your main content goes here */}
      </div>
    </div>
  );
}

export default Slidebar;
