const express = require('express');
const router = express.Router();

// Mock Data Models (would eventually be replaced by DB queries)

// GET /api/stats - Dashboard analytics
router.get('/stats', (req, res) => {
    // Simulate fetching from DB
    res.json({
        revenue: 142520,
        activeUsers: 12842,
        apiSuccessRate: 99.98,
        avgLatency: 248
    });
});

// GET /api/logs - API Logs
router.get('/logs', (req, res) => {
    const logs = [];
    const methods = ['POST', 'GET'];
    const statuses = ['200 OK', '404 NOT FOUND', '500 ERROR'];

    // Generate some initial logs
    for (let i = 0; i < 5; i++) {
        logs.push({
            timestamp: new Date().toISOString(),
            method: methods[Math.floor(Math.random() * methods.length)],
            endpoint: '/v1/chat/completions',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            latency: Math.floor(Math.random() * 200) + 20 + 'ms'
        });
    }
    res.json(logs);
});

// GET /api/current_user - Auth check
router.get('/current_user', (req, res) => {
    // For now, return mock user if no auth implemented yet
    // Once Google Auth is in, this will return req.user
    if (req.user) {
        res.send(req.user);
    } else {
        // Return null or empty object if not logged in
        // For development/demo, we can mock a logged-in user if needed, 
        // but let's stick to true auth flow: return nothing
        res.send(null);
    }
});

module.exports = router;
