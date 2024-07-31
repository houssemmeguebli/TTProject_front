import React, { useState } from 'react';
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

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Attempting to log in with', { email, password });

    try {
      const response = await authService.login(email, password);
      console.log('Login response:', response);

      if (response && response.token) {
        // Save the token
        localStorage.setItem('token', response.token);
        console.log('Token saved:', response.token);

        // Fetch user ID, role, and status directly from AuthService
        try {
          const { userId, role, userStatus } = await authService.getUserIdByEmail(email);
          console.log('User details:', { userId, role, userStatus });

          if (userStatus === 2) {
            console.log('User status is suspended');
            localStorage.removeItem('token', response.token);
            Swal.fire({
              title: 'Account Suspended',
              text: 'Your account has been suspended. Please contact support for further assistance.',
              icon: 'warning',
              confirmButtonText: 'Go Back',
            });
          } else if (userStatus === 0) {
            console.log('User status is inactive, redirecting to change password');
            Swal.fire({
              title: 'Change Password',
              text: 'You need to change your password on first login.',
              icon: 'warning',
              confirmButtonText: 'OK',
            }).then(() => {
              navigate(`/change-password/${userId}`);
            });
          } else {
            Swal.fire({
              title: 'Login Successful',
              text: 'Redirecting to your dashboard...',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              switch (role) {
                case 'ProjectManager':
                  navigate('/calendar');
                  window.location.reload();
                  break;
                case 'Employee':
                  navigate('/CalendarEmployee');
                  window.location.reload();
                  break;
                default:
                  navigate('/dashboard');
              }
              window.location.reload(); // Ensure the page refreshes after navigation
            });
          }
        } catch (userDetailsError) {
          console.error('Error fetching user ID, role, and status:', userDetailsError);
          Swal.fire({
            title: 'Error',
            text: 'Error fetching user details.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      } else {
        console.log('No token found in response.');
        Swal.fire({
          title: 'Error',
          text: 'Invalid login attempt.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        title: 'Error',
        text: error.response ? error.response.data.message : error.message,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <IllustrationLayout
      title="Welcome!"
      description="Use these awesome forms to login or create a new account in your project for free."
      illustration={{
        image: bgImage,
        title: 'Nice to see you!',
        description: 'Keep your face always toward the sunshine—and shadows will fall behind you.',
      }}
    >
      <ArgonBox component="form" role="form" onSubmit={handleSubmit}>
        <ArgonBox mb={2}>
          <ArgonInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
        </ArgonBox>
        <ArgonBox mb={2} position="relative">
          <ArgonInput
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <ArgonBox mt={4} mb={1}>
          <ArgonButton type="submit" color="info" size="large" fullWidth>
            Sign In
          </ArgonButton>
        </ArgonBox>
      </ArgonBox>
    </IllustrationLayout>
  );
}

export default SignIn;
