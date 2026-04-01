const express = require('express');
const checkoutController = require('../controllers/CheckoutController');
const validateRequest = require('../middlewares/validateRequest');
const checkoutValidator = require('../validators/checkoutValidator');

const router = express.Router();

router.post('/', validateRequest(checkoutValidator.create), checkoutController.createCheckout);

module.exports = router;
