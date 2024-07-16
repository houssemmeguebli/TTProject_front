import axios from 'axios';

const API_URL = 'https://localhost:7157/api/Users'; // Adjust the base URL as needed

class UserService {

  async getAllUsers() {
    return await axios.get(`${API_URL}`);
  }
  async getUserWithId(userId) {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async getUserById(userId) {
   try {

    const response = await axios.get(`${API_URL}/getByUserId/${userId}`);
    return  response.data;
  } catch (error) {
    console.error('Error users names :', error);
    throw error;
  }

  }
  async deleteUser(userId) {
    try {

      const response = await axios.delete(`${API_URL}/${userId}`);
      return  response.data;
    } catch (error) {
      console.error('Error users names :', error);
      throw error;
    }

  }

}

export default new UserService();
