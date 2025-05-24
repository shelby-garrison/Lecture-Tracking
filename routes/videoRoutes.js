const express = require('express');
const router = express.Router();
const {
  getLecturePage,
  saveProgress
} = require('../controllers/videoController');


router.get('/lecture', (req, res) => {
  getLecturePage(req, res, {
    userId: 'user123',
    videoId: 'videoABC'
  });
});

// Saving progress API
router.post('/progress', saveProgress);

module.exports = router;
