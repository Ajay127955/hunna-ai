const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('../services/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    try {
        const { displayName, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user = new User({
            displayName,
            email,
            password,
            otp,
            otpExpires,
            isVerified: false
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Send OTP
        const emailSent = await sendOTP(email, otp);
        if (!emailSent) {
            return res.status(500).json({ msg: 'Error sending email. Please try again.' });
        }

        res.status(200).json({ msg: 'Registration successful. OTP sent to email.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'OTP expired' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ msg: 'Account verified successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ msg: 'Account not verified. Please verify your email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Manually log in user with Passport
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ msg: 'Login error' });
            }
            return res.status(200).json({ msg: 'Logged in successfully', user });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
