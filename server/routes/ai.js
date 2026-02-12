const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/chat', aiController.chat);
router.post('/code', aiController.codeAssistant);
router.post('/image', aiController.generateImage);
router.post('/email', aiController.emailReply);

module.exports = router;
