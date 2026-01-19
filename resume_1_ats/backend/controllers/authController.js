const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const storage = require('../config/storage');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user (email/password only)
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, phoneNumber } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();

    // Email/Password signup
    if (!fullName || !trimmedEmail || !trimmedPassword || !phoneNumber) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await storage.findUserByEmail(trimmedEmail);

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt);
    console.log(`Signup: password length=${trimmedPassword.length}, hash length=${hashedPassword.length}`);

    // Create user with email authentication
    const user = await storage.createUser({
        fullName,
        email: trimmedEmail,
        phoneNumber,
        password: hashedPassword,
        authProvider: 'email',
    });

    res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        authProvider: user.authProvider,
        token: generateToken(user._id),
    });
});

// @desc    Authenticate a user (email/password only)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();

    // Email/Password login
    if (!trimmedEmail || !trimmedPassword) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Check for user email
    const user = await storage.findUserByEmail(trimmedEmail);
    console.log('Login attempt for:', trimmedEmail, 'Password length:', trimmedPassword?.length);
    if (user) {
        console.log('User found in DB:', user.email, 'DB Hash length:', user.password?.length);
        const isMatch = await bcrypt.compare(trimmedPassword, user.password);
        console.log('Password match:', isMatch);
        if (isMatch) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                authProvider: user.authProvider,
                token: generateToken(user._id),
            });
            return;
        }
    } else {
        console.log('No user found for email:', email);
    }

    res.status(400);
    throw new Error('Invalid credentials');
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide email address');
    }

    const normalizedEmail = email.toLowerCase();
    // Check if user exists
    const user = await storage.findUserByEmail(normalizedEmail);

    if (!user) {
        res.status(404);
        throw new Error('No account found with that email address');
    }

    // Generate reset token (6-digit code for simplicity)
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Set token expiration (1 hour)
    const expires = new Date(Date.now() + 3600000);

    // Save token to user
    await storage.saveResetToken(email, resetToken, expires);

    // In production, you would send this via email
    // For now, we'll return it in the response
    res.status(200).json({
        message: 'Password reset token generated',
        resetToken: resetToken,
        email: email,
        expiresIn: '1 hour',
        note: 'In production, this token would be sent via email'
    });
});

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        res.status(400);
        throw new Error('Please provide reset token and new password');
    }

    // Find user by valid token
    const user = await storage.findUserByResetToken(token);

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Clear reset token
    await storage.clearResetToken(user._id);

    res.status(200).json({
        message: 'Password reset successful',
        email: user.email
    });
});

// @desc    Update password
// @route   POST /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide current and new password');
    }

    const user = await storage.findUserById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check current password
    if (!(await bcrypt.compare(currentPassword, user.password))) {
        res.status(401);
        throw new Error('Invalid current password');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        message: 'Password updated successfully'
    });
});

// @desc    Delete user account
// @route   DELETE /api/auth/delete
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = await storage.findUserById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await user.remove();

    res.status(200).json({
        message: 'User deleted successfully'
    });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    requestPasswordReset,
    resetPassword,
    updatePassword,
    deleteUser,
};
