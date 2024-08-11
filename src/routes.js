import Profile from "layouts/profile";
import ArgonBox from "components/ArgonBox";
import React from "react";
import Calendar from "./layouts/Calendar";
import Request from "./layouts/Request";
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import AuthService from "./_services/AuthService";
import EmployeeProfiles from "./layouts/EmployeeProfiles";
import Empolyee from "./layouts/Employee";
import DetailsEmp from "./layouts/EmployeeProfiles/DetailsEmp";
import CalendarEmp from "./layouts/Employee/CalenderEmp";
import { Logout } from "@mui/icons-material";

const authService = new AuthService();
const currentUser = authService.getCurrentUser();


const routes = [

  {
    type: "route",
    name: "Calendar",
    key: "Calendar",
    route: "/Calendar",
    icon: (
      <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-calendar-grid-58" />
    ),
    component: <Calendar  />,
    roles: ["ProjectManager"],

  },
  {
    type: "route",
    name: "CalendarEmp ",
    key: "CalendarEmployee",
    route: "/CalendarEmployee",
    icon: (
      <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-calendar-grid-58" />
    ),
    component: <CalendarEmp  />,
    roles: ["Employee"],

  },
  {
    type: "route",
    name: "Liste of Requests",
    key: "Requests",
    route: "/Requests",
    icon: (
      <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-paper-diploma" />
    ),
    component: <Request />,
    roles: ["ProjectManager"],

  },
  {
    type: "route",
    name: "Liste of Requests",
    key: "RequestEmployee",
    route: "/RequestEmployee",
    icon: (
      <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-paper-diploma" />
    ),
    component: <Empolyee />,
    roles: ["Employee"],

  },

  { type: "title", title: "Account Pages", key: "account-pages" },
  {
    type: "route",
    name: "My Profile",
    key: "profileEmp",
    route: `/employee/${currentUser?.id || ""}`,
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-single-02" />,
    component: <DetailsEmp />,
    roles: ["Employee"],

  },
  {
    type: "route",
    name: "My Profile ",
    key: "profileManager",
    route: `/manager/${currentUser?.id || ""}`,
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-single-02" />,
    component: <Profile />,
    roles: ["ProjectManager"],

  },
  {
    type: "route",
    name: "Employee Profiles" ,
    key: "Employee Profiles",
    route: "/EmployeeProfiles",
    icon: <PeopleIcon color="primary" fontSize="14px" />,
    component: <EmployeeProfiles />,
    roles: ["ProjectManager"],
  },

  {
    type: "route",
    name: "Logout",
    key: "logout",
    route: "/logout",
    icon: <LogoutIcon color="error" fontSize="14px" />,
    component: <Logout />,
    roles: ["ProjectManager","Employee"],

  },
];

export default routes;
