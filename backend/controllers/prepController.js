const asyncHandler = require('express-async-handler');
const storage = require('../config/storage');

// @desc    Save interview prep data
// @route   POST /api/prep
// @access  Private
const saveInterviewPrep = asyncHandler(async (req, res) => {
    const { resumeId, industry, role, questions } = req.body;

    if (!resumeId || !questions) {
        res.status(400);
        throw new Error('Please provide resumeId and questions');
    }

    // Verify resume belongs to user
    const resume = await storage.findResumeById(resumeId);
    console.log(`[DEBUG] Saving Prep - ResumeId: ${resumeId}, User: ${req.user.id}`);

    if (!resume) {
        console.log('[DEBUG] Resume not found');
        res.status(404);
        throw new Error('Resume not found');
    }

    console.log(`[DEBUG] Resume Owner: ${resume.user}`);
    if (resume.user.toString() !== req.user.id) {
        console.log('[DEBUG] Unauthorized access');
        res.status(401);
        throw new Error('User not authorized');
    }

    const prepData = {
        user: req.user.id,
        resume: resumeId,
        industry: industry || 'General',
        role: role || 'Professional',
        questions,
    };

    const savedPrep = await storage.saveInterviewPrep(prepData);

    res.status(200).json(savedPrep);
});

// @desc    Get interview prep data by resume ID
// @route   GET /api/prep/:resumeId
// @access  Private
const getInterviewPrep = asyncHandler(async (req, res) => {
    const resumeId = req.params.resumeId;

    // Verify resume exists and belongs to user
    const resume = await storage.findResumeById(resumeId);

    if (!resume) {
        res.status(404);
        throw new Error('Resume not found');
    }

    if (resume.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const prep = await storage.findInterviewPrepByResumeId(resumeId);

    if (prep) {
        res.status(200).json(prep);
    } else {
        // Return empty structure or 404? 
        // 200 with null/empty is often easier for frontend to handle if it's "not generated yet"
        res.status(200).json(null);
    }
});

module.exports = {
    saveInterviewPrep,
    getInterviewPrep
};
