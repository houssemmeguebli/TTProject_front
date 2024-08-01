// EmployeeChangePassword.js
import React, { useState, useEffect } from "react";
import ArgonBox from "components/ArgonBox";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import Swal from "sweetalert2";
import AuthService from "../../../_services/AuthService";
import EmployeeService from "../../../_services/EmployeeService";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import IllustrationLayout from "../components/IllustrationLayout";

const authService = new AuthService();
const employeeService = new EmployeeService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg";

function EmployeeChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [user, setUser] = useState(null);

  const { userID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await employeeService.getEmployeeById(userID);
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (userID) {
      fetchUser();
    }
  }, [userID]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      Swal.fire("Error!", "New passwords do not match.", "error");
      return;
    }
    try {
      if (!userID) {
        throw new Error("User ID is required.");
      }
      await authService.changePassword(userID, currentPassword, newPassword, confirmNewPassword);

      const updatedUser = {
        ...user,
        userStatus: 1,
      };

      await employeeService.updateEmployee(userID, updatedUser);
      Swal.fire("Success!", "Password changed successfully. Please sign in again.", "success");
      navigate("/authentication/sign-in");
    } catch (error) {
      Swal.fire("Error!", `Failed to change password: ${error.message}`, "error");
    }
  };

  return (
    <IllustrationLayout
      title="Change Password"
      description="Change your password to continue"
      illustration={{
        image: bgImage,
        title: '"Security first"',
        description: "Update your password to keep your account secure.",
      }}
    >
    <ArgonBox component="form" role="form" onSubmit={handleSubmit}>
      <ArgonBox mb={2} position="relative">
        <ArgonInput
          type={showCurrentPassword ? "text" : "password"}
          placeholder="Current Password"
          size="large"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
            </button>
          }
        />
      </ArgonBox>
      <ArgonBox mb={2} position="relative">
        <ArgonInput
          type={showNewPassword ? "text" : "password"}
          placeholder="New Password"
          size="large"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showNewPassword ? <Visibility /> : <VisibilityOff />}
            </button>
          }
        />
      </ArgonBox>
      <ArgonBox mb={2} position="relative">
        <ArgonInput
          type={showConfirmNewPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          size="large"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showConfirmNewPassword ? <Visibility /> : <VisibilityOff />}
            </button>
          }
        />
      </ArgonBox>
      <ArgonBox mt={4} mb={1}>
        <ArgonButton type="submit" color="info" size="large" fullWidth>
          Change Password
        </ArgonButton>
      </ArgonBox>
    </ArgonBox>
    </IllustrationLayout>

  );
}

export default EmployeeChangePassword;
