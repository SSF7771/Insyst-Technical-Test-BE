const express = require('express');
const router = express.Router();
const {
    getRooms,
    createBooking,
    getSlot
} = require('../controllers/Controller');

// Get Rooms
router.get('/rooms', getRooms);

// Get Slot (with roomId)
router.get('/slots', getSlot);

// Create Bookings
router.post('/bookings', createBooking);

module.exports = router;