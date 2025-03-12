const express = require('express');
const router = express.Router();
const Table = require('../model/Table'); // Replace with the correct path to your Table model

module.exports = (io) => {

  // CREATE: Add a new table and emit the event to all clients
  router.post('/', async (req, res) => {
    try {
      const table = new Table(req.body);
      const savedTable = await table.save();
      
      // Emit the 'tableAdded' event to all connected clients
      io.emit('postTable', savedTable);
      
      res.status(201).json(savedTable);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // READ: Get all tables
  router.get('/', async (req, res) => {
    try {
      const tables = await Table.find();
      res.status(200).json(tables);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // READ: Get a specific table by ID
  router.get('/:id', async (req, res) => {
    try {
      const table = await Table.findById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: `Table with ID ${req.params.id} not found` });
      }
      res.status(200).json(table);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // UPDATE: Update a table's details
  router.put('/:id', async (req, res) => {
    try {
      const updatedTable = await Table.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedTable) {
        return res.status(404).json({ message: `Table with ID ${req.params.id} not found` });
      }
      io.emit('putTable', updatedTable); // ✅ Fixed the error

      res.status(200).json(updatedTable);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // DELETE: Remove a table
  router.delete('/:id', async (req, res) => {
    try {
      const deletedTable = await Table.findByIdAndDelete(req.params.id);
      if (!deletedTable) {
        return res.status(404).json({ message: `Table with ID ${req.params.id} not found` });
      }
      io.emit('deleteTable', deletedTable._id); // Emit only the ID

      res.status(200).json({ message: 'Table deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
