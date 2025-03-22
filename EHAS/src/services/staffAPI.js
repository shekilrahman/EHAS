// staffAPI.js
import axios from 'axios';

// Create an axios instance with default headers
const api = axios.create({
  baseURL: 'http://localhost:5000/',
  headers: {
    'api-key': 'ehasapikey',
    'Content-Type': 'application/json'
  }
});

// GET all staff members
export const getStaff = async () => {
  try {
    const response = await api.get('/staff');
    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
};

// GET a single staff member by ID
export const getStaffById = async (id) => {
  try {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff by id:", error);
    return null;
  }
};

// CREATE a new staff member
export const createStaff = async (staffData) => {
  try {
    const response = await api.post('/staff', staffData);
    return response.data;
  } catch (error) {
    console.error("Error creating staff:", error);
    return null;
  }
};

// UPDATE an existing staff member
export const updateStaff = async (id, staffData) => {
  try {
    const response = await api.put(`/staff/${id}`, staffData);
    return response.data;
  } catch (error) {
    console.error("Error updating staff:", error);
    return null;
  }
};

// DELETE a staff member
export const deleteStaff = async (id) => {
  try {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting staff:", error);
    return null;
  }
};
