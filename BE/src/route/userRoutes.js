const express = require('express');
const { getUsers } = require('../controller/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authorize('admin'), protect, getUsers);

module.exports = router;