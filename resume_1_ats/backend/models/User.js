const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // Allow null values for unique constraint
        },
        phoneNumber: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // Allow null values for unique constraint
        },
        password: {
            type: String,
            required: false, // Not required for Firebase OTP users
        },
        authProvider: {
            type: String,
            enum: ['email', 'phone', 'google'],
            default: 'phone',
        },
        resetPasswordToken: {
            type: String,
            required: false,
        },
        resetPasswordExpires: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
