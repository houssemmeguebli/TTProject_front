import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import ArgonBox from "components/ArgonBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import routes from "routes";
import { useArgonController, setMiniSidenav, setOpenConfigurator } from "context";
import brand from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import "assets/css/nucleo-icons.css";
import "assets/css/nucleo-svg.css";
import Index from "./layouts/Request/addRequest";
import Tables from "./layouts/Request";
import UpdateRequest from "./layouts/Request/UpdateRequest/UpdateRequest";
import Employee from "./layouts/Request/Employee";
import AddRequestEmp from "./layouts/Request/Employee/AddRequestEmpolyee";
import UpdateRequestEmp from "./layouts/Request/Employee/UpdateRequestEmp";
import SignIn from "./layouts/authentication/sign-in";
import { AuthProvider } from "./_services/AuthContext.js";
import ProtectedRoute from "./_services/ProtectedRoute";
import Unauthorized from "./Unauthorized/Unauthorized";
import SignUp from "./layouts/authentication/sign-up";
import EmployeeProfiles from "./layouts/EmployeeProfiles";
import Profile from "./layouts/profile";
import Calendar from "./Calendar";
import Dashboard from "./layouts/dashboard";
import Request from "./layouts/Request";
import { Logout } from "@mui/icons-material";
import AuthService from "./_services/AuthService";
import Swal from "sweetalert2";
import DetailsEmp from "./layouts/EmployeeProfiles/DetailsEmp";
import CalendarEmp from "./layouts/Request/Employee/CalenderEmp";
import EmployeeChangePassword from "./layouts/authentication/ChangePassword/EmployeeChangePassword";
import ProjectManagerService from "./_services/ProjectManagerService";
import ProjectManagerChangePassword from "./layouts/authentication/ChangePassword/ProjectManagerChangePassword";
const authService = new AuthService();

export default function App() {
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, direction, layout, openConfigurator, sidenavColor, darkSidenav, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const roles = {
    employee: 'Employee',
    projectManager: 'ProjectManager'
  };
  const user = authService.getCurrentUser();

  const handleOnSubmit = () => {
    navigate('/tables');
  };

  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };
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
        if(user.role==="ProjectManager"){
          navigate("/calender");
        }
        else{
          navigate("/CalendarEmployee");
        }
      }
    };

    React.useEffect(() => {
      handleLogout();
    }, []);

    // Return nothing as the component's effect handles everything
    return null;
  };


  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const configsButton = (
    <ArgonBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.5rem"
      height="3.5rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="default" color="inherit">
        settings
      </Icon>
    </ArgonBox>
  );

  return direction === "rtl" ? (
    <AuthProvider>
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
          <CssBaseline />
          {layout === "dashboard" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={darkSidenav || darkMode ? brand : brandDark}
                brandName="TTProject"
                routes={routes}
              />
              <Configurator />
            </>
          )}
          <Routes>
            {getRoutes(routes)}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </ThemeProvider>
      </CacheProvider>
    </AuthProvider>
  ) : (
    <AuthProvider>
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={darkSidenav || darkMode ? brand : brandDark}
              brandName="TTProject"
              routes={routes}
            />
            <Configurator />
          </>
        )}
        <Routes>
          {/* Public Routes */}
          <Route path="/authentication/sign-in" element={<SignIn />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/change-Employeepassword/:userID" element={<EmployeeChangePassword />} />
          <Route path="/change-Managerpassword/:ManagerID" element={<ProjectManagerChangePassword />} />


          {/* Protected Routes for All Users */}
          <Route element={<ProtectedRoute roles={[roles.projectManager, roles.employee]} />}>
            <Route path="/employee/:employeeId" element={<DetailsEmp />}/>
            <Route path="/*" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/logout" element={<Logout />} />
          </Route>
          {/* Protected Routes for ProjectManager Role */}
          <Route element={<ProtectedRoute roles={[roles.projectManager]} />}>
            <Route path="/manager/:managerId" element={<Profile />}/>
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/EmployeeProfiles" element={<EmployeeProfiles />} />
            <Route path="/authentication/sign-up" element={<SignUp />} />
            <Route path="/Requests" element={<Request />} />
            <Route path="/add" element={<Index onSubmit={handleOnSubmit} />} />
            <Route path="/editRequest/:requestId" element={<UpdateRequest />} />
          </Route>
          {/* Protected Routes for Employee Role */}
          <Route element={<ProtectedRoute roles={[roles.employee]} />}>
            <Route path="/RequestEmployee" element={<Employee />} />
            <Route path="/CalendarEmployee" element={<CalendarEmp />} />
            <Route path="/AddRequestEmp" element={<AddRequestEmp onSubmit={handleOnSubmit} />} />
            <Route path="/editRequestEmp/:requestId" element={<UpdateRequestEmp />} />
          </Route>

        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}
