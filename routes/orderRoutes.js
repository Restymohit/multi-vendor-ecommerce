const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Cart = require('../models/cart'); // Assuming you already have this
const protect = require('../middlewares/auth');

// POST /api/orders - Place an order
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Only customers can place orders
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can place orders' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((acc, item) => {
      return acc + item.productId.price * item.quantity;
    }, 0);

    // Create new order
    const newOrder = new Order({
      userId,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      })),
      totalPrice
    });

    await newOrder.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET /api/orders - Get all orders for logged-in customer
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can view their orders' });
    }

    const orders = await Order.find({ userId }).populate('items.productId');

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
