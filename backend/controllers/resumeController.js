const asyncHandler = require('express-async-handler');
const storage = require('../config/storage');

// @desc    Get user resumes
// @route   GET /api/resumes
// @access  Private
const getResumesHandler = asyncHandler(async (req, res) => {
    const resumes = await storage.findResumesByUserId(req.user._id);
    res.status(200).json(resumes);
});

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
const getResumeHandler = asyncHandler(async (req, res) => {
    const resume = await storage.findResumeById(req.params.id);

    if (!resume) {
        res.status(404);
        throw new Error('Resume not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the resume user
    if (resume.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized');
    }

    res.status(200).json(resume);
});

// @desc    Create resume
// @route   POST /api/resumes
// @access  Private
const createResumeHandler = asyncHandler(async (req, res) => {
    const {
        title,
        personal_info,
        summary,
        experience,
        education,
        skills,
        projects,
        certifications,
        languages,
        template,
        design,
        industry,
        showProfilePicture,
        section_order,
        interests
    } = req.body;

    const resume = await storage.createResume({
        user: req.user._id,
        title,
        personal_info,
        summary,
        experience,
        education,
        skills,
        projects,
        certifications,
        languages,
        template,
        design,
        industry,
        showProfilePicture,
        section_order,
        interests
    });

    res.status(200).json(resume);
});

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
const updateResumeHandler = asyncHandler(async (req, res) => {
    const resume = await storage.findResumeById(req.params.id);

    if (!resume) {
        res.status(404);
        throw new Error('Resume not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the resume user
    if (resume.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedResume = await storage.updateResume(req.params.id, req.body);

    res.status(200).json(updatedResume);
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResumeHandler = asyncHandler(async (req, res) => {
    const resume = await storage.findResumeById(req.params.id);

    if (!resume) {
        res.status(404);
        throw new Error('Resume not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the resume user
    if (resume.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await storage.deleteResume(req.params.id);

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getResumes: getResumesHandler,
    getResume: getResumeHandler,
    createResume: createResumeHandler,
    updateResume: updateResumeHandler,
    deleteResume: deleteResumeHandler,
};
