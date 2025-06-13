import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const fetchStudentData = async () => {
    const stuEmail = localStorage.getItem('stu_email');
    if (!stuEmail) {
      console.error('No student email found in localStorage');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5002/borrowStuData?stu_email=${stuEmail}`);
      const data = await response.json();
      if (response.ok && data.length > 0) {
        setFirstName(data[0].stu_fname);
        setLastName(data[0].stu_lname);
      } else {
        console.error('Error fetching student data:', data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stu_email');
    navigate('/login');
  };

  useEffect(() => {
    fetchStudentData();
  }, []);
  
  return (
    <nav className="w-full bg-LightGray text-white p-4 fixed top-0 z-5">
      <div className="container flex justify-between items-center " style={{ marginLeft: 'auto', marginRight: '50px' }}>
        {/* <h1 className="text-xl font-bold">M</h1> */}
        <div className="flex-grow flex justify-end items-center space-x-4">
          <span className="text-lg text-black">{`${firstName} ${lastName}`}</span>

          <div className="relative">
            <button onClick={toggleDropdown} className="focus:outline-none text-black">
              <FontAwesomeIcon icon={faUserCircle} size="lg" />
            </button>

            {isOpen && (
              <ul className="dropdown-menu absolute right-0 mt-2 w-48 bg-white text-black shadow-md rounded-lg py-2">
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">Profile</li>
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={handleLogout}>
                  Logout
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
