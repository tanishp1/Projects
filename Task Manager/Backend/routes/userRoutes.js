const express = require('express');
const { adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// User Management Routes
router.get('/',protect, adminOnly,getUsers);
router.get('/:id', protect, getUserById);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;