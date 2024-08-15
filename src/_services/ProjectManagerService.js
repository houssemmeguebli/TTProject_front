import axios from './Instance';


const API_BASE_URL = '/ProjectManager';
class ProjectManagerService {
  constructor(API_URL = API_BASE_URL) {
    this.API_URL = API_URL;
  }

  async getAllUsers() {
    try {
      const response = await axios.get(this.API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  async createProjectManager(projectManager) {
    try {
      const response = await axios.post(this.API_URL, projectManager);
      return response.data;
    } catch (error) {
      console.error('Error creating project manager:', error);
      throw error;
    }
  }

  async getUserWithId(managerId) {
    try {
      const response = await axios.get(`${this.API_URL}/${managerId}`);
      console.log("Project Manager:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching project manager:", error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const response = await axios.get(`${this.API_URL}/getByUserId/${userId}`);
      return response.data;
      console.log("Response test :", response.data);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const response = await axios.delete(`${this.API_URL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateProjectManager(managerId, updatedProjectManager) {
    try {
      const response = await axios.put(`${this.API_URL}/${managerId}`, updatedProjectManager);
      return response.data;
    } catch (error) {
      console.error('Error updating project manager:', error);
      throw error;
    }
  }

  async getRequestsByManagerId(managerId) {
    try {
      const response = await axios.get(`${this.API_URL}/${managerId}/requests`);
      return response.data;
    } catch (error) {
      console.error('Error fetching requests by manager ID:', error);
      throw error;
    }
  }
}

export default ProjectManagerService;
