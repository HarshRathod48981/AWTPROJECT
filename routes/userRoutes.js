const express = require('express');
const { getUserProfile, getDiscoverUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/discover', getDiscoverUsers);
router.get('/:username', getUserProfile);

module.exports = router;
