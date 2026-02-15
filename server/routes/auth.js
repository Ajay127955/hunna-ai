const passport = require('passport');
const express = require('express');
const router = express.Router();

// Google Auth Routes Removed

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/current_user', (req, res) => {
    res.send(req.user);
});

const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/request-reset', authController.requestReset);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
