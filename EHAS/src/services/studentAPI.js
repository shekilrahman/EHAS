import axios from 'axios';

// Create an axios instance with default headers
const api = axios.create({
  baseURL: 'http://localhost:5000/',
  headers: {
    'api-key': 'ehasapikey',
    'Content-Type': 'application/json'
  }
});

// GET all students
export const getStudents = async () => {
  try {
    const response = await api.get('/student');
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

// GET a single student by ID
export const getStudentById = async (id) => {
  try {
    const response = await api.get(`/student/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student by id:", error);
    return null;
  }
};

// CREATE a new student
export const createStudent = async (studentData) => {
  try {
    const response = await api.post('/student', studentData);
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    return null;
  }
};

// UPDATE an existing student
export const updateStudent = async (id, studentData) => {
  try {
    const response = await api.put(`/student/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error updating student:", error);
    return null;
  }
};

// DELETE a student
export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/student/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting student:", error);
    return null;
  }
};

// REGISTER exam(s) for an existing student
// newExams should be an array of exam objects, e.g. [{ exam_id: '...', status: 'upcoming' }]
export const registerExamForStudent = async (id, newExams) => {
  try {
    const response = await api.put(`/student/${id}/add-exams`, { newExams });
    return response.data;
  } catch (error) {
    console.error("Error registering exam for student:", error);
    return null;
  }
};

// SEARCH for a student by registration number
export const searchStudentByRegNo = async (reg_no) => {
  try {
    const response = await api.get('/student/search', { params: { reg_no } });
    return response.data;
  } catch (error) {
    console.error("Error searching student by reg_no:", error);
    return null;
  }
};
