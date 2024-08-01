import axios from 'axios';

const API_BASE_URL = 'https://localhost:7157/api/Employee';

class EmployeeService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getEmployeeById(employeeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/${employeeId}`);
      return response.data;
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
      throw error;
    }
  }

  async createEmployee(employee) {
    try {
      const response = await axios.post(this.baseUrl, employee);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  async getAllEmployees() {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching all employees:', error);
      throw error;
    }
  }

  async updateEmployee(employeeId, updatedEmployee) {
    try {
      await axios.put(`${this.baseUrl}/${employeeId}`, updatedEmployee);
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }
  async deleteEmployee(employeeId) {
    try {
      await axios.delete(`${this.baseUrl}/${employeeId}`);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
  async getRequestsByEmployeeId  (employeeId)  {
    try {
      const response = await axios.get(`${this.baseUrl}/${employeeId}/requests`);
      return response.data;
    } catch (error) {
      console.error('Error fetching requests by employee ID:', error);
      throw error;
    }
  };
}

export default EmployeeService;
