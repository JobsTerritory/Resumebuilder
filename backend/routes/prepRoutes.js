const express = require('express');
const router = express.Router();
const { saveInterviewPrep, getInterviewPrep } = require('../controllers/prepController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, saveInterviewPrep);
router.get('/:resumeId', protect, getInterviewPrep);

module.exports = router;
