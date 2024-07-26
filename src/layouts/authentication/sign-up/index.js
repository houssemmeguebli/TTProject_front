import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import Swal from "sweetalert2";
import AuthService from "../../../_services/AuthService";
import EmailService from "../../../_services/EmailService";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";

const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";
const authService = new AuthService();

function Cover() {
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [projectName, setProjectName] = useState(""); // For Project Manager
  const [position, setPosition] = useState(""); // For Employee

  const roles = [
    { value: 0, label: "Project Manager" },
    { value: 1, label: "Employee" },
  ];

  const handleRoleChange = (event, value) => {
    setRole(value ? value.value : "");
  };

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const generatePassword = (firstName) => {
    const currentYear = new Date().getFullYear();
    const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    return `TT${currentYear}@${capitalizedFirstName}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!firstName || !lastName || !email || !phone || !department || role === "") {
      Swal.fire("Error!", "Please fill in all required fields.", "error");
      return;
    }

    const password = generatePassword(firstName);

    const user = {
      firstName,
      lastName,
      email,
      password,
      phone,
      department,
      role,
      projectName: role === 0 ? projectName : "", // Include only if role is Project Manager
      position: role === 1 ? position : "", // Include only if role is Employee
    };

    try {
      await authService.register(user);
      await EmailService.sendEmail(user.email, user.firstName, user.password);
      Swal.fire("Success!", "User registered successfully and email sent!", "success");
    } catch (error) {
      console.error("Error creating user:", error);
      Swal.fire("Error!", "Error registering user or sending email.", "error");
    }
  };

  return (
    <DashboardLayout
      sx={{
        backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
          `${linearGradient(
            rgba(gradients.info.main, 0.6),
            rgba(gradients.info.state, 0.6)
          )}, url(${bgImage})`,
        backgroundPositionY: "50%",
      }}
    >
      <DashboardNavbar />
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" marginTop="7%">
        <Card sx={{ width: '80%', maxWidth: 800, p: 3 }}>
          <ArgonBox mb={1} textAlign="center">
            <ArgonTypography variant="h4" fontWeight="medium">
              Add New Employee
            </ArgonTypography>
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="body2" color="textSecondary" textAlign="center">
              Please read the notice below carefully before filling out the form.
            </ArgonTypography>
            <hr />
          </ArgonBox>
          <ArgonBox pt={2} pb={3} px={3}>
            <ArgonBox component="form" role="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ArgonInput placeholder="First Name" value={firstName} onChange={handleInputChange(setFirstName)} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ArgonInput placeholder="Last Name" value={lastName} onChange={handleInputChange(setLastName)} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <ArgonInput type="email" placeholder="Email" value={email} onChange={handleInputChange(setEmail)} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ArgonInput placeholder="Phone" value={phone} onChange={handleInputChange(setPhone)} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ArgonInput placeholder="Department" value={department} onChange={handleInputChange(setDepartment)} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    options={roles}
                    getOptionLabel={(option) => option.label}
                    value={roles.find((role) => role.value === role)}
                    onChange={handleRoleChange}
                    renderInput={(params) => <TextField {...params} label="Role" variant="outlined" />}
                  />
                </Grid>
                {role === 0 && (
                  <Grid item xs={12}>
                    <ArgonInput placeholder="Project Name" value={projectName} onChange={handleInputChange(setProjectName)} fullWidth />
                  </Grid>
                )}
                {role === 1 && (
                  <Grid item xs={12}>
                    <ArgonInput placeholder="Position" value={position} onChange={handleInputChange(setPosition)} fullWidth />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <ArgonButton type="submit" variant="gradient" color="info" fullWidth>
                    Register
                  </ArgonButton>
                </Grid>
              </Grid>
            </ArgonBox>
          </ArgonBox>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default Cover;
