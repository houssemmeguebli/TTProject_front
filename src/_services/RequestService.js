import axios from './Instance';

const API_URL = '/Request';

class RequestService {
    constructor(baseUrl = API_URL) {
        this.baseUrl = baseUrl;
    }

    async getAllRequests() {
        try {
            const response = await axios.get(this.baseUrl);
            return response.data;
        } catch (error) {
            console.error('Error fetching requests:', error);
            throw error;
        }
    }

    async getRequestById(requestId) {
        try {
            const response = await axios.get(`${this.baseUrl}/${requestId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching request with ID ${requestId}:`, error);
            throw error;
        }
    }

    async createRequest(request, userRole) {
        try {
            const response = await axios.post(`${this.baseUrl}/${userRole}`, request);
            return response.data;
        } catch (error) {
            console.error('Error creating request:', error);
            throw error;
        }
    }

    async deleteRequest(requestId) {
        try {
            await axios.delete(`${this.baseUrl}/${requestId}`);
        } catch (error) {
            console.error(`Error deleting request with ID ${requestId}:`, error);
            throw error;
        }
    }

    async updateRequest(requestId, updatedRequest) {
        try {
            await axios.put(`${this.baseUrl}/${requestId}`, updatedRequest);
        } catch (error) {
            console.error(`Error updating request with ID ${requestId}:`, error);
            throw error;
        }
    }

    async updateRequestStatus(requestId, statusUpdate) {
        try {
            await axios.put(`${this.baseUrl}/${requestId}/status`, statusUpdate); // Use PUT or POST based on API design
        } catch (error) {
            console.error(`Error updating status for request with ID ${requestId}:`, error);
            throw error;
        }
    }
}

export default RequestService;
