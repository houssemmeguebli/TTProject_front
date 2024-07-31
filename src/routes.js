import Dashboard from "layouts/dashboard";
import Profile from "layouts/profile";
import SignUp from "layouts/authentication/sign-up";
import ArgonBox from "components/ArgonBox";
import React from "react";
import Calendar from "./Calendar";
import Request from "./layouts/Request";

import Icon from "@mui/material/Icon";
import AuthService from "./_services/AuthService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import EmployeeProfiles from "./layouts/EmployeeProfiles";
import Empolyee from "./layouts/Request/Employee";
import DetailsEmp from "./layouts/EmployeeProfiles/DetailsEmp";
import CalendarEmp from "./layouts/Request/Employee/CalenderEmp"; // Import the AuthService

const authService = new AuthService();
const currentUser = authService.getCurrentUser();
const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await authService.logout();
        navigate("/authentication/sign-in");
        Swal.fire(
          'Logged Out!',
          'You have been logged out successfully.',
          'success'
        );
      } catch (error) {
        console.error('Error logging out:', error);
        Swal.fire(
          'Error!',
          'There was an error logging out. Please try again.',
          'error'
        );
      }
    } else {
      navigate("/dashboard"); // Navigate to dashboard if the user cancels the logout
    }
  };

  React.useEffect(() => {
    handleLogout();
  }, []);

  // Return nothing as the component's effect handles everything
  return null;
};



const routes = [
  {
    type: "route",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <Dashboard />,
    roles: ["ProjectManager","Employee"],
  },
  {
    type: "route",
    name: "Calendar",
    key: "Calendar",
    route: "/Calendar",
    icon: (
      <ArgonBox component="i" color="warning" fontSize="14px" className="ni ni-calendar-grid-58" />
    ),
    component: <Calendar  />,
    roles: ["ProjectManager"],

  },
  {
    type: "route",
    name: "Calendar ",
    key: "CalendarEmployee",
    route: "/CalendarEmployee",
    icon: (
      <ArgonBox component="i" color="warning" fontSize="14px" className="ni ni-calendar-grid-58" />
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
      <ArgonBox component="i" color="warning" fontSize="14px" className="ni ni-paper-diploma" />
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
      <ArgonBox component="i" color="warning" fontSize="14px" className="ni ni-paper-diploma" />
    ),
    component: <Empolyee />,
    roles: ["Employee"],

  },

  { type: "title", title: "Account Pages", key: "account-pages" },
  {
    type: "route",
    name: "My Profile",
    key: "profile",
    route: `/employee/${currentUser?.id || ""}`,
    icon: <ArgonBox component="i" color="dark" fontSize="14px" className="ni ni-single-02" />,
    component: <DetailsEmp />,
    roles: ["ProjectManager", "Employee"],

  },
  {
    type: "route",
    name: "Employees Profiles",
    key: "Employees Profiles",
    route: "/EmployeeProfiles",
    icon: <ArgonBox component="i" color="info" fontSize="14px" className="ni ni-collection" />,
    component: <EmployeeProfiles />,
    roles: ["ProjectManager"],
  },
  {
    type: "route",
    name: "Add New Empolyee",
    key: "sign-up",
    route: "/authentication/sign-up",
    icon: <ArgonBox component="i" color="info" fontSize="14px" className="ni ni-collection" />,
    component: <SignUp />,
    roles: ["ProjectManager"],
  },
  {
    type: "route",
    name: "Logout",
    key: "logout",
    route: "/logout",
    icon: <Icon color="error" fontSize="14px" className="ni ni-button-power" />,
    component: <Logout />,
    roles: ["ProjectManager","Employee"],

  },
];

export default routes;
