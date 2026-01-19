const express = require('express');
const router = express.Router();
const { scoreResume } = require('../controllers/scoreController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temp storage

router.post('/', upload.single('resume'), scoreResume);

module.exports = router;
