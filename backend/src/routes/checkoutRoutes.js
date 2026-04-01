const express = require('express');
const checkoutController = require('../controllers/CheckoutController');
const validateRequest = require('../middlewares/validateRequest');
const checkoutValidator = require('../validators/checkoutValidator');

const router = express.Router();

router.get('/', checkoutController.getAllCheckouts);
router.post('/', validateRequest(checkoutValidator.create), checkoutController.createCheckout);
router.put('/:id/return', checkoutController.returnCheckout);

module.exports = router;
