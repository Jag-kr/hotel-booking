const router = require('express').Router();
const { processPayment, getPayment } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, processPayment);
router.get('/:bookingId', authenticate, getPayment);

module.exports = router;
