import React, { useState, useEffect } from "react";
import ArgonBox from "components/ArgonBox";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import Swal from "sweetalert2";
import AuthService from "../../../_services/AuthService";
import ProjectManagerService from "../../../_services/ProjectManagerService";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import IllustrationLayout from "../components/IllustrationLayout";

const authService = new AuthService();
const projectManagerService = new ProjectManagerService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg";

function ProjectManagerChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [user, setUser] = useState(null);

  const { ManagerID } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await projectManagerService.getUserWithId(ManagerID);
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.log("Error fetching project manager by ID:", error);
      }
    };

    if (ManagerID) {
      fetchUser();
    }
  }, [ManagerID]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      Swal.fire("Error!", "New passwords do not match.", "error");
      return;
    }
    try {
      if (!ManagerID) {
        throw new Error("User ID is required.");
      }
      await authService.changePassword(ManagerID, currentPassword, newPassword, confirmNewPassword);

      const updatedUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        userStatus: 1,
        projectName: user.projectName,
      };

      await projectManagerService.updateProjectManager(ManagerID, updatedUser);
      Swal.fire("Success!", "Password changed successfully. Please sign in again.", "success");
      navigate("/authentication/sign-in");
      localStorage.removeItem('token');
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

export default ProjectManagerChangePassword;
