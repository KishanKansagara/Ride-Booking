const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const { auth, checkRole } = require('../middleware/auth');

// Request a ride (Rider only)
router.post('/', auth, checkRole(['rider']), async (req, res) => {
  try {
    const { pickup, destination, fare, distance, duration } = req.body;

    const ride = new Ride({
      rider: req.user._id,
      pickup,
      destination,
      fare,
      distance,
      duration
    });

    await ride.save();

    // Emit socket event to all drivers
    req.app.get('io').emit('ride-requested', {
      ride: {
        id: ride._id,
        pickup,
        destination,
        fare,
        distance,
        duration
      }
    });

    res.status(201).json({
      message: 'Ride requested successfully',
      ride
    });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting ride', error: error.message });
  }
});

// Get available rides (Driver only)
router.get('/available', auth, checkRole(['driver']), async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'requested' })
      .populate('rider', 'name phone')
      .select('-__v');

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available rides', error: error.message });
  }
});

// Accept a ride (Driver only)
router.post('/:id/accept', auth, checkRole(['driver']), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride is no longer available' });
    }

    ride.driver = req.user._id;
    ride.status = 'accepted';
    await ride.save();

    // Emit socket event to rider
    req.app.get('io').to(`rider:${ride.rider}`).emit('ride-accepted', {
      ride: {
        id: ride._id,
        driver: {
          id: req.user._id,
          name: req.user.name,
          phone: req.user.phone
        }
      }
    });

    res.json({
      message: 'Ride accepted successfully',
      ride
    });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting ride', error: error.message });
  }
});

// Complete a ride (Driver only)
router.post('/:id/complete', auth, checkRole(['driver']), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this ride' });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({ message: 'Ride is not in accepted state' });
    }

    ride.status = 'completed';
    await ride.save();

    // Emit socket event to rider
    req.app.get('io').to(`rider:${ride.rider}`).emit('ride-completed', {
      ride: {
        id: ride._id
      }
    });

    res.json({
      message: 'Ride completed successfully',
      ride
    });
  } catch (error) {
    res.status(500).json({ message: 'Error completing ride', error: error.message });
  }
});

// Get user's rides
router.get('/me', auth, async (req, res) => {
  try {
    const query = req.user.role === 'rider' 
      ? { rider: req.user._id }
      : { driver: req.user._id };

    const rides = await Ride.find(query)
      .populate('rider', 'name phone')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rides', error: error.message });
  }
});

module.exports = router; 