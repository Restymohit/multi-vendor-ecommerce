const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const protect = require('../middlewares/auth');

// Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can access the cart' });
    }

    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ customer: req.user.id });

    if (!cart) {
      cart = new Cart({ customer: req.user.id, items: [{ product: productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.json({ message: 'Item added to cart', cart });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View cart
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart is empty' });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ message: 'Item removed from cart', cart });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
