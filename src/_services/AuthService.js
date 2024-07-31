import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Use named import correctly

const API_BASE_URL = 'https://localhost:7157/api/Auth';

class AuthService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async register(userData) {
    try {
      console.log("Register request data:", userData);
      const response = await axios.post(`${this.baseUrl}/register`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Register response data:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error registering:', error.response ? error.response.data : error.message);
      throw error;
    }
  }


  async login(email, password) {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, {
        email,
        password,
      });
      return response.data; // Ensure this contains the Token
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decode the token
        console.log('Decoded Token:', decodedToken);
        return {
          id: decodedToken.id,
          role: decodedToken.role,
          email: decodedToken.email,
          firstName: decodedToken.firstName || '',
          lastName: decodedToken.lastName || '',
          department: decodedToken.department || ''
        };
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  async logout() {
    try {
      const response = await axios.post(`${this.baseUrl}/logout`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      localStorage.removeItem('token');
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword, confirmNewPassword) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/change-password/${userId}`,
        { currentPassword, newPassword, confirmNewPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'An error occurred while changing the password.';
    }
  }


  async getUserIdByEmail(email) {
    console.log(`Fetching user details for email: ${email}`);

    try {
      const response = await axios.get(`${this.baseUrl}/user-id`, {
        params: { email },
        headers: {
          'accept': '*/*'
        }
      });
      console.log('API Response:', response.data);
        return {
          userId: response.data.userId,
          role: response.data.role,
          userStatus: response.data.userStatus
        };

    } catch (error) {
      console.error('Error fetching user ID, role, and status:', error.response?.data?.message || error.message);
      throw error;
    }
  }


}

  export default AuthService;
