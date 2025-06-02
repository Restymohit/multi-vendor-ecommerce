const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const protect = require('../middlewares/auth');
const User = require('../models/user');

// Create a new product (Vendor only)
router.post('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'vendor') {
      return res.status(403).json({ message: "Only vendors can add products" });
    }

    const { name, description, price, quantity, category, image } = req.body;

    const product = new Product({
      name,
      description,
      price,
      quantity,
      category,
      image,
      vendor: user._id
    });

    await product.save();
    res.status(201).json({ message: 'Product created', product });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('vendor', 'name email');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (Vendor only, and only their own product)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (user.role !== 'vendor' || product.vendor.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updates = req.body;
    Object.assign(product, updates);

    await product.save();
    res.json({ message: 'Product updated', product });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (Vendor only, and only their own product)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (user.role !== 'vendor' || product.vendor.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.remove();
    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/products/:id - View single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
