const express = require('express');
const router = express.Router();
const Menu = require('../model/Menu'); // Replace with the correct path to your Menu model

// CREATE: Add a new menu item
router.post('/', async (req, res) => {
  try {
    const menu = new Menu(req.body);
    const savedMenu = await menu.save();
    res.status(201).json(savedMenu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ: Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuList = await Menu.find();
    res.status(200).json(menuList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get a specific menu item by ID
router.get('/:id', async (req, res) => {
  try {
    // Use _id field instead of menu_id
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE: Update a menu item's details
router.put('/:id', async (req, res) => {
  try {
    // Use _id field instead of menu_id
    const updatedMenuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json(updatedMenuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Remove a menu item
router.delete('/:id', async (req, res) => {
  try {
    // Use _id field instead of menu_id
    const deletedMenuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!deletedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
