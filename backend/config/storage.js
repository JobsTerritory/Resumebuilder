const mongoose = require('mongoose');
const User = require('../models/User');
const localStorage = require('./localStorage');

// Check if MongoDB is connected
const isMongoConnected = () => {
    const connected = mongoose.connection.readyState === 1;
    if (!connected) {
        console.warn('MongoDB not connected, falling back to local storage');
    }
    return connected;
};

// Storage abstraction layer
const storage = {
    // User operations
    async findUserByEmail(email) {
        if (isMongoConnected()) {
            return await User.findOne({ email });
        } else {
            return localStorage.findUserByEmail(email);
        }
    },

    async findUserById(id) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            return await User.findById(id).select('-password');
        } else {
            const user = localStorage.findUserById(id);
            if (user && user.password) {
                // Remove password from returned object
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }
            return user;
        }
    },

    async createUser(userData) {
        if (isMongoConnected()) {
            return await User.create(userData);
        } else {
            return localStorage.createUser(userData);
        }
    },

    // Resume operations
    async findResumesByUserId(userId) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(userId)) {
            const Resume = require('../models/Resume');
            return await Resume.find({ user: userId });
        } else {
            return localStorage.findResumesByUserId(userId);
        }
    },

    async findResumeById(id) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const Resume = require('../models/Resume');
            return await Resume.findById(id);
        } else {
            return localStorage.findResumeById(id);
        }
    },

    async createResume(resumeData) {
        if (isMongoConnected()) {
            const Resume = require('../models/Resume');
            return await Resume.create(resumeData);
        } else {
            return localStorage.createResume(resumeData);
        }
    },

    async updateResume(id, updateData) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const Resume = require('../models/Resume');
            return await Resume.findByIdAndUpdate(id, updateData, { new: true });
        } else {
            return localStorage.updateResume(id, updateData);
        }
    },

    async deleteResume(id) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const Resume = require('../models/Resume');
            await Resume.findByIdAndDelete(id);
            return true;
        } else {
            return localStorage.deleteResume(id);
        }
    },

    // Password reset operations
    async saveResetToken(email, token, expires) {
        if (isMongoConnected()) {
            return await User.findOneAndUpdate(
                { email },
                {
                    resetPasswordToken: token,
                    resetPasswordExpires: expires
                },
                { new: true }
            );
        } else {
            return localStorage.saveResetToken(email, token, expires);
        }
    },

    async findUserByResetToken(token) {
        if (isMongoConnected()) {
            return await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
        } else {
            return localStorage.findUserByResetToken(token);
        }
    },

    async clearResetToken(userId) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(userId)) {
            return await User.findByIdAndUpdate(
                userId,
                {
                    resetPasswordToken: undefined,
                    resetPasswordExpires: undefined
                },
                { new: true }
            );
        } else {
            return localStorage.clearResetToken(userId);
        }
    },

    // Interview Prep operations
    async saveInterviewPrep(prepData) {
        if (isMongoConnected()) {
            const InterviewPrep = require('../models/InterviewPrep');
            return await InterviewPrep.findOneAndUpdate(
                { resume: prepData.resume },
                prepData,
                { new: true, upsert: true }
            );
        } else {
            return localStorage.saveInterviewPrep(prepData);
        }
    },

    async findInterviewPrepByResumeId(resumeId) {
        if (isMongoConnected()) {
            const InterviewPrep = require('../models/InterviewPrep');
            return await InterviewPrep.findOne({ resume: resumeId });
        } else {
            return localStorage.findInterviewPrepByResumeId(resumeId);
        }
    }
};

module.exports = storage;
