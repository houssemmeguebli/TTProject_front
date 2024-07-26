import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = 'https://localhost:7157/api/Auth';

class AuthService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async register(userData) {
    try {
      // Log userData before sending
      console.log("Register request data:", userData);

      const response = await axios.post(`${this.baseUrl}/register`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Log response data
      console.log("Register response data:", response.data);

      return response.data;
    } catch (error) {
      console.error('Error registering:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async login(userData) {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the token
        const decodedToken = jwtDecode(token);
        console.log('Decoded Token:', decodedToken); // Log the decoded token for debugging

        // Extract user information
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


}

export default AuthService;
