import axios from 'axios';

const API_URL = 'https://localhost:7157/api/ProjectManager';

class ProjectManagerService {

  async getAllUsers() {
    return await axios.get(`${API_URL}`);
  }
  async createProjectManager(ProjectManager) {
    try {
      const response = await axios.post(API_URL, ProjectManager);
      return response.data;
    } catch (error) {
      console.error('Error creating project manager:', error);
      throw error;
    }
  }
  async getUserWithId(userId) {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Project Manager:", error);
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
  async updateProjectManager(projectManagerId, updatedProjectManager) {
    try {
      await axios.put(`${API_URL}/${projectManagerId}`, updatedProjectManager);
    } catch (error) {
      console.error('Error updating project manager:', error);
      throw error;
    }
  }


}

export default  ProjectManagerService;
