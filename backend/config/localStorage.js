const fs = require('fs');
const path = require('path');

// Data directory and file paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RESUMES_FILE = path.join(DATA_DIR, 'resumes.json');

// Ensure data directory exists
const ensureDataDir = () => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
};

// ===== USER STORAGE =====

// Load users from file
const loadUsers = () => {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
};

// Save users to file
const saveUsers = (users) => {
    ensureDataDir();
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving users:', error);
        throw new Error('Failed to save user data');
    }
};

// Find user by email
const findUserByEmail = (email) => {
    const users = loadUsers();
    if (!email) return null;
    const searchEmail = email.toLowerCase();
    return users.find(user => (user.email || '').toLowerCase() === searchEmail);
};

// Find user by ID
const findUserById = (id) => {
    const users = loadUsers();
    return users.find(user => user._id === id);
};

// Create new user
const createUser = (userData) => {
    const users = loadUsers();

    // Check if user already exists
    if (userData.email && findUserByEmail(userData.email)) {
        throw new Error('User already exists');
    }

    // Generate unique ID
    const newUser = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return newUser;
};

// ===== RESUME STORAGE =====

// Load resumes from file
const loadResumes = () => {
    ensureDataDir();
    if (!fs.existsSync(RESUMES_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(RESUMES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading resumes:', error);
        return [];
    }
};

// Save resumes to file
const saveResumes = (resumes) => {
    ensureDataDir();
    try {
        fs.writeFileSync(RESUMES_FILE, JSON.stringify(resumes, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving resumes:', error);
        throw new Error('Failed to save resume data');
    }
};

// Find resumes by user ID
const findResumesByUserId = (userId) => {
    const resumes = loadResumes();
    return resumes.filter(resume => resume.user === userId);
};

// Find resume by ID
const findResumeById = (id) => {
    const resumes = loadResumes();
    return resumes.find(resume => resume._id === id);
};

// Create new resume
const createResume = (resumeData) => {
    const resumes = loadResumes();

    const newResume = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...resumeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    resumes.push(newResume);
    saveResumes(resumes);

    return newResume;
};

// Update resume
const updateResume = (id, updateData) => {
    const resumes = loadResumes();
    const index = resumes.findIndex(resume => resume._id === id);

    if (index === -1) {
        throw new Error('Resume not found');
    }

    resumes[index] = {
        ...resumes[index],
        ...updateData,
        updatedAt: new Date().toISOString()
    };

    saveResumes(resumes);
    return resumes[index];
};

// Delete resume
const deleteResume = (id) => {
    const resumes = loadResumes();
    const filteredResumes = resumes.filter(resume => resume._id !== id);

    if (resumes.length === filteredResumes.length) {
        throw new Error('Resume not found');
    }

    saveResumes(filteredResumes);
    return true;
};

const INTERVIEW_PREPS_FILE = path.join(DATA_DIR, 'interviewPreps.json');

// ... (previous code) ...

// ===== INTERVIEW PREP STORAGE =====

// Load preps from file
const loadInterviewPreps = () => {
    ensureDataDir();
    if (!fs.existsSync(INTERVIEW_PREPS_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(INTERVIEW_PREPS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading interview preps:', error);
        return [];
    }
};

// Save preps to file
const saveInterviewPreps = (preps) => {
    ensureDataDir();
    try {
        fs.writeFileSync(INTERVIEW_PREPS_FILE, JSON.stringify(preps, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving interview preps:', error);
        throw new Error('Failed to save interview prep data');
    }
};

// Find prep by resume ID
const findInterviewPrepByResumeId = (resumeId) => {
    const preps = loadInterviewPreps();
    return preps.find(prep => prep.resume === resumeId);
};

// Save or Update Interview Prep
const saveInterviewPrep = (prepData) => {
    const preps = loadInterviewPreps();
    const index = preps.findIndex(p => p.resume === prepData.resume);

    let savedPrep;

    if (index !== -1) {
        // Update existing
        preps[index] = {
            ...preps[index],
            ...prepData,
            updatedAt: new Date().toISOString()
        };
        savedPrep = preps[index];
    } else {
        // Create new
        savedPrep = {
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...prepData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        preps.push(savedPrep);
    }

    saveInterviewPreps(preps);
    return savedPrep;
};

module.exports = {
    // User functions
    findUserByEmail,
    findUserById,
    createUser,

    // Resume functions
    findResumesByUserId,
    findResumeById,
    createResume,
    updateResume,
    deleteResume,

    // Interview Prep functions
    findInterviewPrepByResumeId,
    saveInterviewPrep
};
