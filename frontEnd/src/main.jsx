import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'font-awesome/css/font-awesome.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';




import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import PrivateRoute from './PrivateRoute.jsx';

import StuHome from './user/components/StuHome.jsx';
import Form from './user/components/Form.jsx';
import Login from './user/components/Login.jsx';
import Homeadmin from './admin/components/Homeadmin.jsx';
import AddDetails from './admin/components/AddDetails.jsx';
import Notebooklist from './admin/components/Notebooklist.jsx';
import ReqHistory from './user/components/ReqHistory.jsx';
import NotebookDetail from './admin/components/NotebookDetail.jsx';
import DetailsReq from './user/components/DetailsReq.jsx';
import Pageborrowing from './admin/components/Pageborrowing.jsx';
import PageReturn from './admin/components/PageReturn.jsx';
import AllNotebookDT from './admin/components/AllNotebookDT.jsx';
import Waitingpage from './admin/components/Waitingpage.jsx';

import DetailsWaiting from './admin/components/DetailsWaiting.jsx';
import DetailsReqadmin from './admin/components/DetailsReqadmin.jsx';
import Detailsborrowing from './admin/components/Detailsborrowing.jsx';
import DetailsReturn from './admin/components/DetailsReturn.jsx';
import EditDetailNB from './admin/components/EditDetailNB.jsx';

import Testadmin from './admin/components/Testadmin.jsx';
import Textuser from './user/components/Textuser.jsx';
import Register from './user/components/Register.jsx';

import Editforquota from './admin/components/Editforquota.jsx';
import PageOfficerlist from './admin/components/PageOfficerlist.jsx';
import Addofficer from './admin/components/Addofficer.jsx';
import Dashboad from './admin/components/Dashboad.jsx';

import PageReturnLate from './admin/components/PageReturnLate.jsx';


// สร้าง router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/form",
    element: <PrivateRoute><Form /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/Register",
    element: <Register /> 
  },
  {
    path: "/StuHome",
    element: <PrivateRoute><StuHome /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/ReqHistory",
    element: <PrivateRoute><ReqHistory /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/DetailsReq",
    element: <PrivateRoute><DetailsReq /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/DetailsReq/:borrowId", // กำหนด :borrowId เป็น dynamic parameter
    element: <PrivateRoute><DetailsReq /></PrivateRoute> // ใช้ PrivateRoute
  },

  // Admin
  {
    path: "/admin/Home",
    element: <PrivateRoute><Homeadmin /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/Details",
    element: <PrivateRoute><AddDetails /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/Notebooklist",
    element: <PrivateRoute><Notebooklist /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/ApproveRequest",
    element: <PrivateRoute><Homeadmin /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/notebookdetail",
    element: <PrivateRoute><NotebookDetail /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/notebookborrowing",
    element: <PrivateRoute><Pageborrowing /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/notebookreturn",
    element: <PrivateRoute><PageReturn/></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/Allnotebook",
    element: <PrivateRoute><AllNotebookDT/></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/notebookwaiting",
    element: <PrivateRoute><Waitingpage /></PrivateRoute> // ใช้ PrivateRoute
  },


  {
    path: "/admin/DetailsReq/:borrowId",
    element: <PrivateRoute><DetailsReqadmin /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/DetailsWaiting/:borrowId",
    element: <PrivateRoute><DetailsWaiting /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/Detailsborrowing/:borrowId",
    element: <PrivateRoute><Detailsborrowing /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/DetailsReturn/:borrowId",
    element: <PrivateRoute><DetailsReturn /></PrivateRoute> // ใช้ PrivateRoute
  },

  {
    path: "/admin/EditDetailNotebook/:laptopTag",
    element: <PrivateRoute><EditDetailNB /></PrivateRoute> // ใช้ PrivateRoute
  },

  
  {
    path: "/admin/EditForm",
    element: <PrivateRoute><Editforquota /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/OfficerList",
    element: <PrivateRoute><PageOfficerlist /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/admin/AddOfficer",
    element: <PrivateRoute><Addofficer /></PrivateRoute> // ใช้ PrivateRoute
  },

  {
    path: "/admin/Dashboad",
    element: <PrivateRoute><Dashboad /></PrivateRoute> // ใช้ PrivateRoute
  },

  {
    path: "/admin/PageReturnLate",
    element: <PrivateRoute><PageReturnLate /></PrivateRoute> // ใช้ PrivateRoute
  },






  {
    path: "/test",
    element: <PrivateRoute><Testadmin /></PrivateRoute> // ใช้ PrivateRoute
  },
  {
    path: "/test2",
    element: <PrivateRoute><Textuser /></PrivateRoute> // ใช้ PrivateRoute
  },
 




]);

// เรียกใช้ react root และ router
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
