import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import Socials from "layouts/authentication/components/Socials";
import Separator from "layouts/authentication/components/Separator";

const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signup-cover.jpg";

function Cover() {
  const [role, setRole] = useState("");
  const [position, setPosition] = useState("");
  const [projectName, setProjectName] = useState("");

  const handleRoleChange = (event, value) => {
    setRole(value);
  };

  const handlePositionChange = (event) => {
    setPosition(event.target.value);
  };

  const handleProjectNameChange = (event) => {
    setProjectName(event.target.value);
  };

  const roles = ["Employee", "Project Manager"];

  return (
    <CoverLayout
      title="Welcome!"
      description="Use these forms to sign up as an Employee or Project Manager."
      image={bgImage}
      imgPosition="top"
      button={{ color: "dark", variant: "gradient" }}
    >
      <Card>
        <ArgonBox p={3} mb={1} textAlign="center">
          <ArgonTypography variant="h5" fontWeight="medium">
            Register with
          </ArgonTypography>
        </ArgonBox>
        <ArgonBox mb={2}>
          <Socials />
        </ArgonBox>
        <ArgonBox px={12}>
          <Separator />
        </ArgonBox>
        <ArgonBox pt={2} pb={3} px={3}>
          <ArgonBox component="form" role="form">
            <ArgonBox mb={2}>
              <ArgonInput placeholder="First Name" />
            </ArgonBox>
            <ArgonBox mb={2}>
              <ArgonInput placeholder="Last Name" />
            </ArgonBox>
            <ArgonBox mb={2}>
              <ArgonInput type="email" placeholder="Email" />
            </ArgonBox>
            <ArgonBox mb={2}>
              <ArgonInput type="password" placeholder="Password" />
            </ArgonBox>
            <ArgonBox mb={2}>
              <ArgonInput placeholder="Phone" />
            </ArgonBox>
            <ArgonBox mb={2}>
              <ArgonInput placeholder="Department" />
            </ArgonBox>
            <ArgonBox mb={2}>
              <Autocomplete
                options={roles}
                value={role}
                onChange={handleRoleChange}
                renderInput={(params) => <TextField {...params} label="Role" />}
              />
            </ArgonBox>
            {role === "Employee" && (
              <ArgonBox mb={2}>
                <ArgonInput placeholder="Position" value={position} onChange={handlePositionChange} />
              </ArgonBox>
            )}
            {role === "Project Manager" && (
              <ArgonBox mb={2}>
                <ArgonInput placeholder="Project Name" value={projectName} onChange={handleProjectNameChange} />
              </ArgonBox>
            )}
            <ArgonBox display="flex" alignItems="center">
              <Checkbox defaultChecked />
              <ArgonTypography
                variant="button"
                fontWeight="regular"
                sx={{ cursor: "pointer", userSelect: "none" }}
              >
                &nbsp;&nbsp;I agree to the&nbsp;
              </ArgonTypography>
              <ArgonTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                textGradient
              >
                Terms and Conditions
              </ArgonTypography>
            </ArgonBox>
            <ArgonBox mt={4} mb={1}>
              <ArgonButton variant="gradient" color="dark" fullWidth>
                Sign Up
              </ArgonButton>
            </ArgonBox>
            <ArgonBox mt={2}>
              <ArgonTypography variant="button" color="text" fontWeight="regular">
                Already have an account?&nbsp;
                <ArgonTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="dark"
                  fontWeight="bold"
                  textGradient
                >
                  Sign In
                </ArgonTypography>
              </ArgonTypography>
            </ArgonBox>
          </ArgonBox>
        </ArgonBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
