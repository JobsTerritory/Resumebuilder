const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    requestPasswordReset,
    resetPassword,
    updatePassword,
    deleteUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/update-password', protect, updatePassword);
router.delete('/delete', protect, deleteUser);

module.exports = router;
