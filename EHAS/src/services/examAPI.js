// examAPI.js
import axios from 'axios';

// Create an axios instance with default headers
const api = axios.create({
  baseURL: 'http://localhost:5000/',
  headers: {
    'api-key': 'ehasapikey',
    'Content-Type': 'application/json'
  }
});

// GET all exams
export const getExams = async () => {
  try {
    const response = await api.get('/exam');
    return response.data;
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
};

// GET a single exam by ID
export const getExamById = async (id) => {
  try {
    const response = await api.get(`/exam/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching exam by id:", error);
    return null;
  }
};

// CREATE a new exam
export const createExam = async (examData) => {
  try {
    const response = await api.post('/exam', examData);
    return response.data;
  } catch (error) {
    console.error("Error creating exam:", error);
    return null;
  }
};

// UPDATE an existing exam
export const updateExam = async (id, examData) => {
  try {
    const response = await api.put(`/exam/${id}`, examData);
    return response.data;
  } catch (error) {
    console.error("Error updating exam:", error);
    return null;
  }
};

// DELETE an exam
export const deleteExam = async (id) => {
  try {
    const response = await api.delete(`/exam/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting exam:", error);
    return null;
  }
};
