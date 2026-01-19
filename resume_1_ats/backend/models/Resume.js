const mongoose = require('mongoose');

const resumeSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: { type: String, default: 'My Resume' },
        personal_info: {
            fullName: String,
            email: String,
            phone: String,
            location: String,
            linkedin: String,
            website: String,
            profilePicture: String,
            title: String
        },
        summary: String,
        experience: [
            {
                id: String,
                company: String,
                position: String,
                location: String,
                startDate: String,
                endDate: String,
                current: Boolean,
                description: String,
            }
        ],
        education: [
            {
                id: String,
                institution: String,
                degree: String,
                field: String,
                location: String,
                startDate: String,
                endDate: String,
                current: Boolean,
                gpa: String,
            }
        ],
        skills: [String],
        projects: [
            {
                id: String,
                name: String,
                description: String,
                technologies: [String],
                url: String,
                startDate: String,
                endDate: String,
            }
        ],
        certifications: [
            {
                id: String,
                name: String,
                issuer: String,
                date: String,
                url: String,
            }
        ],
        languages: [
            {
                id: String,
                name: String,
                proficiency: String,
            }
        ],
        interests: [String],
        template: { type: String, default: 'tech-modern' },
        design: { type: String, default: 'professional-clean' },
        industry: { type: String, default: 'technology' },
        showProfilePicture: { type: Boolean, default: true },
        section_order: [String],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Resume', resumeSchema);
