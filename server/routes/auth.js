const router = require('express').Router();
const { register, login, adminLogin, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', authenticate, getMe);

module.exports = router;
