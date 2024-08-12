import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArgonBox from 'components/ArgonBox';
import ArgonInput from 'components/ArgonInput';
import ArgonButton from 'components/ArgonButton';
import IllustrationLayout from 'layouts/authentication/components/IllustrationLayout';
import Swal from 'sweetalert2';
import AuthService from '../../../_services/AuthService';

const authService = new AuthService();

const bgImage = 'https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    console.log('Sending password reset link to:', email);

    try {
      await authService.forgotPassword(email);
      Swal.fire({
        title: 'Email Sent',
        text: 'A pin code has been sent to your email.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate(`/resetpassword?email=${encodeURIComponent(email)}`);
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      Swal.fire({
        title: 'Error',
        text: 'Could not send password reset email. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IllustrationLayout
      title="Forgot your password?"
      description="Enter your email address to reset your password."
      illustration={{
        image: bgImage,
        title: 'Reset Password',
        description: 'Don’t worry, we’ll send you an email to reset your password.',
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
        <ArgonBox mt={4} mb={1}>
          <ArgonButton type="submit" color="info" size="large" fullWidth disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </ArgonButton>
        </ArgonBox>
      </ArgonBox>
    </IllustrationLayout>
  );
}

export default ForgotPassword;
