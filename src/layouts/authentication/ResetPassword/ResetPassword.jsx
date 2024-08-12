import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import ArgonBox from 'components/ArgonBox';
import ArgonInput from 'components/ArgonInput';
import ArgonButton from 'components/ArgonButton';
import IllustrationLayout from 'layouts/authentication/components/IllustrationLayout';
import Swal from 'sweetalert2';
import AuthService from '../../../_services/AuthService';
import { Visibility, VisibilityOff } from "@mui/icons-material";

const authService = new AuthService();

const bgImage = 'https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg';

function ResetPassword() {
  const [pinCode, setPinCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [showResendButton, setShowResendButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 0) {
          clearInterval(timer);
          setShowResendButton(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.search]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    try {
      const response = await authService.resetPassword(email, pinCode, newPassword);
      console.log('Reset Password response:', response);

      await  Swal.fire({
        title: 'Password Reset Successful',
        text: 'Your password has been reset successfully. You can now log in with your new password.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/authentication/sign-in');
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      await Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to reset password. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleResendCode = async () => {
    try {
      // Call the API to resend the code
      await authService.forgotPassword(email);
      await Swal.fire({
        title: 'PIN Code Sent',
        text: 'A new PIN code has been sent to your email.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
      setShowResendButton(false);
      setTimeRemaining(15 * 60); // Reset the timer
    } catch (error) {
      console.error('Error resending PIN code:', error);
      await  Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to resend PIN code. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <IllustrationLayout
      title="Reset Your Password"
      description="Please enter the PIN code sent to your email along with your new password."
      illustration={{
        image: bgImage,
        title: 'Secure your account',
        description: 'Enter your new password below.',
      }}
    >
      <ArgonBox component="form" role="form" onSubmit={handleResetPassword}>
        <ArgonBox mb={2}>
          <ArgonInput
            type="text"
            placeholder="PIN Code"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            required
            fullWidth
          />
        </ArgonBox>
        <ArgonBox mb={2} position="relative">
          <ArgonInput
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
          />
          <ArgonBox
            position="absolute"
            right={0}
            top={0}
            bottom={0}
            display="flex"
            alignItems="center"
            pr={1}
          >
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </button>
          </ArgonBox>
        </ArgonBox>

        <ArgonBox mb={2} display="flex" flexDirection="column" alignItems="center">
          <div style={{ textAlign: 'center', fontSize: '18px', color: '#007bff' }}>
            <p>Time Remaining:</p>
            <div style={{ fontWeight: 'bold', fontSize: '25px', backgroundColor: '#f1f1f1', padding: '10px', borderRadius: '5px' }}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </ArgonBox>

        {showResendButton && (
          <ArgonBox mb={2} display="flex" justifyContent="center">
            <ArgonButton
              type="button"
              color="primary"
              size="large"
              onClick={handleResendCode}
            >
              Resend PIN Code
            </ArgonButton>
          </ArgonBox>
        )}
        <ArgonBox mt={4} mb={1}>
          <ArgonButton type="submit" color="info" size="large" fullWidth>
            Reset Password
          </ArgonButton>
        </ArgonBox>
      </ArgonBox>
    </IllustrationLayout>
  );
}

export default ResetPassword;
