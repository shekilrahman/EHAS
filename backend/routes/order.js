const express = require('express');
const Order = require('../model/Order');
const Menu = require('../model/Menu'); // Assuming you have a Menu model
const router = express.Router();

module.exports = (io) => {
  // CREATE: Add a new order
  router.post('/', async (req, res) => {
    try {
      const order = new Order(req.body);
    
      // Fetch menu items based on the item IDs
      const menuItems = await Menu.find({ _id: { $in: order.items.map(i => i.item_id) } });
    
      // Calculate total amount
      order.total_amount = order.items.reduce((sum, item) => {
        const menuItem = menuItems.find(m => m._id.equals(item.item_id));
        return sum + (menuItem ? menuItem.price * item.quantity : 0);
      }, 0);
    
      const savedOrder = await order.save();
    
      // Populate staff and menu item details
      const populatedOrder = await Order.findById(savedOrder._id)
        .populate('staff_id') // Populate staff details
        .populate('items.item_id'); // Populate menu item details
    
      io.emit('postOrder', populatedOrder);
      res.status(201).json(populatedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
    
  });
// READ: Get all orders for the specified date (default: today)
router.get('/', async (req, res) => {
  try {
    let startOfDay, endOfDay;

    if (req.query.date) {
      // Parse the provided date (expecting format like 'YYYY-MM-DD')
      const baseDate = new Date(req.query.date);
      if (isNaN(baseDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format. Expected YYYY-MM-DD.' });
      }
      startOfDay = new Date(baseDate.setHours(0, 0, 0, 0));
      endOfDay = new Date(baseDate.setHours(23, 59, 59, 999));
    } else {
      // Default to current day
      const now = new Date();
      startOfDay = new Date(now.setHours(0, 0, 0, 0));
      endOfDay = new Date(now.setHours(23, 59, 59, 999));
    }

    // Fetch orders for the specific day
    const orders = await Order.find({
      datetime: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('items.item_id')
      .populate('staff_id');

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message });
  }
});

  // READ: Get a specific order by ID
  router.get('/:id', async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('items.item_id').populate('staff_id');
      if (!order) {
        return res.status(404).json({ message: `Order with ID ${req.params.id} not found` });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // READ: Get a specific order by table number
  router.get('/table/:tableNumber', async (req, res) => {
    try {
      const { tableNumber } = req.params;
      const order = await Order.findOne({ 
        table_number: tableNumber, 
        status: { $in: ["active", "new", "updated"] } 
      }).populate('items.item_id')
        .populate('staff_id');

      if (!order) {
        return res.status(404).json({ message: `No active order found for table ${tableNumber}` });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching active order:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // UPDATE: Update an order
  router.put('/:id', async (req, res) => {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({ message: `Order with ID ${req.params.id} not found` });
      }
      
      // Recalculate total amount
      const menuItems = await Menu.find({ _id: { $in: updatedOrder.items.map(i => i.item_id) } });
      updatedOrder.total_amount = updatedOrder.items.reduce((sum, item) => {
        const menuItem = menuItems.find(m => m._id.equals(item.item_id));
        return sum + (menuItem ? menuItem.price * item.quantity : 0);
      }, 0);
      
      await updatedOrder.save();
      const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('staff_id') // Populate staff details
      .populate('items.item_id'); // Populate menu item details

      io.emit('updateOrder', populatedOrder);
      res.status(200).json(populatedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // ADD NEW ITEM TO EXISTING ORDER
  router.put('/:id/add-items', async (req, res) => {
    try {
      const { newItems } = req.body;
  
      if (!Array.isArray(newItems) || newItems.length === 0) {
        return res.status(400).json({ message: "Invalid items array" });
      }
  
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      newItems.forEach(({ item_id, quantity }) => {
        const existingItem = order.items.find((item) => item.item_id.toString() === item_id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          order.items.push({ item_id, quantity });
        }
      });

      // Recalculate total amount
      const menuItems = await Menu.find({ _id: { $in: order.items.map(i => i.item_id) } });
      order.total_amount = order.items.reduce((sum, item) => {
        const menuItem = menuItems.find(m => m._id.equals(item.item_id));
        return sum + (menuItem ? menuItem.price * item.quantity : 0);
      }, 0);

      const updatedOrder = await order.save();
      const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('staff_id') // Populate staff details
      .populate('items.item_id'); // Populate menu item details

      io.emit('updateOrderItems', populatedOrder);
      res.status(200).json(populatedOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // DELETE: Remove an order
  router.delete('/:id', async (req, res) => {
    try {
      const deletedOrder = await Order.findByIdAndDelete(req.params.id);
      if (!deletedOrder) {
        return res.status(404).json({ message: `Order with ID ${req.params.id} not found` });
      }
      io.emit('deleteOrder', deletedOrder._id);
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get("/stat/stat", async (req, res) => {
    try {
      let start, end;
  
      if (req.query.date) {
        // Parse the provided date (expecting format like 'YYYY-MM-DD')
        const baseDate = new Date(req.query.date);
        if (isNaN(baseDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD." });
        }
        start = new Date(baseDate.setHours(0, 0, 0, 0));
        end = new Date(baseDate.setHours(23, 59, 59, 999));
      } else {
        // Default to current day
        const now = new Date();
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
      }
  
      // Query orders within the given datetime range
      const orders = await Order.find({ datetime: { $gte: start, $lte: end } }).populate("items.item_id");
  
      // Calculate statistics
      const totalOrders = orders.length;
      const totalOrdersDineIn = orders.filter((order) => order.type === "dine-in").length;
      const totalOrdersTakeaway = orders.filter((order) => order.type === "takeaway").length;
  
      const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalPaidAmount = orders.reduce((sum, order) => sum + (order.paid_amount || 0), 0);
      const paidUPI = orders.reduce((sum, order) => sum + (order.upi || 0), 0);
      const paidCash = orders.reduce((sum, order) => sum + (order.cash || 0), 0);
  
      // Additional statistics: Item-level analysis
      let totalItemsSold = 0;
      let itemSales = {}; // { "Item Name": Total Quantity Sold }
  
      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const itemName = item.item_id?.name;
            if (!itemName) return;
  
            totalItemsSold += item.quantity;
            itemSales[itemName] = (itemSales[itemName] || 0) + item.quantity;
          });
        }
      });
  
      // Determine most and least sold items
      let mostSoldItem = null;
      let leastSoldItem = null;
  
      if (Object.keys(itemSales).length > 0) {
        const sortedItems = Object.entries(itemSales).sort((a, b) => b[1] - a[1]);
        mostSoldItem = { name: sortedItems[0][0], quantity: sortedItems[0][1] };
        leastSoldItem = {
          name: sortedItems[sortedItems.length - 1][0],
          quantity: sortedItems[sortedItems.length - 1][1],
        };
      }
  
      res.json({
        totalOrders,
        totalOrdersDineIn,
        totalOrdersTakeaway,
        totalAmount,
        totalPaidAmount,
        paidUPI,
        paidCash,
        totalItemsSold,
        itemSales,
        mostSoldItem,
        leastSoldItem,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching statistics", error });
    }
  });
  
  router.get("/statRange/:startDate/:endDate", async (req, res) => {
    try {
        let { startDate, endDate } = req.params;

        let start = new Date(startDate);
        let end = new Date(endDate);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: "Invalid date format. Use YYYY-MM-DD."
            });
        }

        let dailyStats = [];
        let overallStats = {
            totalOrders: 0,
            totalOrdersDineIn: 0,
            totalOrdersTakeaway: 0,
            totalAmount: 0,
            totalPaidAmount: 0,
            paidUPI: 0,
            paidCash: 0,
            totalItemsSold: 0,
            itemSales: {}
        };

        let current = new Date(start);
        while (current <= end) {
            let dayStart = new Date(current);
            dayStart.setHours(0, 0, 0, 0); // Start at midnight

            let dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999); // End at 11:59 PM

            // Fetch orders for this day
            let orders = await Order.find({
                datetime: { $gte: dayStart, $lte: dayEnd }
            }).populate("items.item_id");

            if (orders.length === 0) {
                // Skip this day if no orders
                current.setDate(current.getDate() + 1);
                continue;
            }

            // Calculate daily stats
            let dayStats = {
                date: dayStart.toISOString().split("T")[0], // Format: YYYY-MM-DD
                totalOrders: orders.length,
                totalOrdersDineIn: orders.filter(order => order.type === "dine-in").length,
                totalOrdersTakeaway: orders.filter(order => order.type === "takeaway").length,
                totalAmount: orders.reduce((sum, order) => sum + order.total_amount, 0),
                totalPaidAmount: orders.reduce((sum, order) => sum + (order.paid_amount || 0), 0),
                paidUPI: orders.reduce((sum, order) => sum + (order.upi || 0), 0),
                paidCash: orders.reduce((sum, order) => sum + (order.cash || 0), 0),
                totalItemsSold: 0,
                itemSales: {}
            };

            orders.forEach(order => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const itemName = item.item_id?.name;
                        if (!itemName) return;

                        dayStats.totalItemsSold += item.quantity;
                        dayStats.itemSales[itemName] = (dayStats.itemSales[itemName] || 0) + item.quantity;

                        // Update overall stats
                        overallStats.totalItemsSold += item.quantity;
                        overallStats.itemSales[itemName] = (overallStats.itemSales[itemName] || 0) + item.quantity;
                    });
                }
            });

            // Add to dailyStats only if there were orders
            dailyStats.push(dayStats);

            // Update overall totals
            overallStats.totalOrders += dayStats.totalOrders;
            overallStats.totalOrdersDineIn += dayStats.totalOrdersDineIn;
            overallStats.totalOrdersTakeaway += dayStats.totalOrdersTakeaway;
            overallStats.totalAmount += dayStats.totalAmount;
            overallStats.totalPaidAmount += dayStats.totalPaidAmount;
            overallStats.paidUPI += dayStats.paidUPI;
            overallStats.paidCash += dayStats.paidCash;

            // Move to the next day
            current.setDate(current.getDate() + 1);
        }

        res.json({ dailyStats, overallStats });

    } catch (error) {
        res.status(500).json({ message: "Error fetching statistics", error });
    }
});

  return router;
};
