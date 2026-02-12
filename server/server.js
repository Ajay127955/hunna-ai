require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const cookieSession = require('cookie-session');
const passport = require('passport');
require('./models/User');
require('./config/passport');

// Middleware
app.use(cors());
app.use(express.json());
app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [process.env.COOKIE_KEY || 'hunna-ai-secret-key']
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const aiRoutes = require('./routes/ai'); // [NEW]

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/ai', aiRoutes); // [NEW]

const path = require('path');

// Serve UI files statically
app.use('/UI', express.static(path.join(__dirname, '../UI')));
app.get('/', (req, res) => {
    res.redirect('/UI/index.html');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
