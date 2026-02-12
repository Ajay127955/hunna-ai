const passport = require('passport');
const express = require('express');
const router = express.Router();

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google'),
    (req, res) => {
        res.redirect('/UI/dashboard.html');
    }
);

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

module.exports = router;
