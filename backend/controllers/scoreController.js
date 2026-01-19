const asyncHandler = require('express-async-handler');

// @desc    Score a resume (Mock)
// @route   POST /api/score
// @access  Public (or Private)
const scoreResume = asyncHandler(async (req, res) => {
    // In a real app, we would process the file here.
    // req.file would contain the uploaded file if using multer.

    // Mock Response
    const score = Math.floor(Math.random() * (98 - 70 + 1) + 70); // Random score 70-98

    const feedback = {
        score,
        summary: "Your resume is strong but could use more action verbs.",
        details: {
            impact: "Good use of quantification.",
            brevity: "Summary is slightly too long.",
            style: "Clean and professional layout detected."
        },
        suggestions: [
            "Use more active voice in your experience section.",
            "Add a 'Skills' section if missing.",
            "Ensure your contact info is up to date."
        ]
    };

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.status(200).json(feedback);
});

module.exports = { scoreResume };
