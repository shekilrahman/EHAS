// roomAPI.js
import axios from 'axios';

// Create an axios instance with default headers
const api = axios.create({
  baseURL: 'http://localhost:5000/',
  headers: {
    'api-key': 'ehasapikey',
    'Content-Type': 'application/json'
  }
});

// GET all rooms
export const getRooms = async () => {
  try {
    const response = await api.get('/room');
    return response.data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
};

// GET a single room by ID
export const getRoomById = async (id) => {
  try {
    const response = await api.get(`/room/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching room by id:", error);
    return null;
  }
};

// CREATE a new room
export const createRoom = async (roomData) => {
  try {
    const response = await api.post('/room', roomData);
    return response.data;
  } catch (error) {
    console.error("Error creating room:", error);
    return null;
  }
};

// UPDATE an existing room
export const updateRoom = async (id, roomData) => {
  try {
    const response = await api.put(`/room/${id}`, roomData);
    return response.data;
  } catch (error) {
    console.error("Error updating room:", error);
    return null;
  }
};

// DELETE a room
export const deleteRoom = async (id) => {
  try {
    const response = await api.delete(`/room/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting room:", error);
    return null;
  }
};
