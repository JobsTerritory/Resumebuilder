import { generateCoverLetter } from './src/lib/gemini';
import { Resume } from './src/types';

const mockResume: Resume = {
    personal_info: {
        fullName: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        location: "New York",
        title: "Software Engineer",
        linkedin: "",
        website: "",
        profilePicture: "",
        dateOfBirth: "",
        customFields: []
    },
    summary: "Experienced developer",
    experience: [],
    internships: [],
    education: [],
    skills: ["React", "TypeScript"],
    projects: [],
    certifications: [],
    languages: [],
    interests: [],
    industry: "Tech",
    section_order: []
};

const mockJD = "Seeking a React developer.";

async function runTest() {
    console.log("Starting cover letter generation test...");
    try {
        const result = await generateCoverLetter(mockResume, mockJD);
        console.log("Result length:", result.length);
        if (result.length > 0) {
            console.log("Preview:", result.substring(0, 100));
        } else {
            console.log("Error: Result is empty. Check your API key and input.");
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

runTest();
