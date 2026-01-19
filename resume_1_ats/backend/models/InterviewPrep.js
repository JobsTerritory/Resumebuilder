const mongoose = require('mongoose');

const interviewPrepSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        resume: {
            type: String, // Changed to String to support both ObjectId and UUIDs
            required: true,
            ref: 'Resume',
        },
        industry: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        questions: [
            {
                id: String,
                question: String,
                answerKey: String,
                tips: [String],
            }
        ],
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one prep per resume (optional, but good for this use case)
// or just findOne to get the latest. Let's keep it simple for now and just allow multiple or latest.
// We'll update the existing one if it exists for the resume to avoid clutter.

module.exports = mongoose.model('InterviewPrep', interviewPrepSchema);
