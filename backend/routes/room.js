const express = require('express');
const router = express.Router();
const Room = require('../model/Room'); 

module.exports = (io) => {

  // CREATE: Add a new room and emit the event to all clients
  router.post('/', async (req, res) => {
    try {
      const room = new Room(req.body);
      const savedRoom = await room.save();
      
      // Emit the 'postRoom' event to all connected clients
      io.emit('postRoom', savedRoom);
      
      res.status(201).json(savedRoom);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // READ: Get all rooms (with populated staff and seat details)
  router.get('/', async (req, res) => {
    try {
      const rooms = await Room.find()
        .populate('staff_id')
        .populate('seats.student')
        .populate('seats.exam');
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // READ: Get a specific room by ID
  router.get('/:id', async (req, res) => {
    try {
      const room = await Room.findById(req.params.id)
        .populate('staff_id')
        .populate('seats.student')
        .populate('seats.exam');
      if (!room) {
        return res.status(404).json({ message: `Room with ID ${req.params.id} not found` });
      }
      res.status(200).json(room);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // UPDATE: Update a room's details
  router.put('/:id', async (req, res) => {
    try {
      const updatedRoom = await Room.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedRoom) {
        return res.status(404).json({ message: `Room with ID ${req.params.id} not found` });
      }
      io.emit('putRoom', updatedRoom);
      res.status(200).json(updatedRoom);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // DELETE: Remove a room
  router.delete('/:id', async (req, res) => {
    try {
      const deletedRoom = await Room.findByIdAndDelete(req.params.id);
      if (!deletedRoom) {
        return res.status(404).json({ message: `Room with ID ${req.params.id} not found` });
      }
      io.emit('deleteRoom', deletedRoom._id); // Emit only the ID
      res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
