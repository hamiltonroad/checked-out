const express = require('express');
const patronController = require('../controllers/PatronController');
const { standardLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.get('/', standardLimiter, patronController.listPatrons);

module.exports = router;
