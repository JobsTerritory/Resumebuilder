const mongoose = require('mongoose');
require('dotenv').config();
const Resume = require('./models/Resume');
const InterviewPrep = require('./models/InterviewPrep');

const debugData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const resumes = await Resume.find({});
        console.log(`Total Resumes: ${resumes.length}`);
        resumes.forEach(r => {
            console.log(`Resume: ${r.title}, ID: ${r._id}, User: ${r.user}`);
        });

        const preps = await InterviewPrep.find({});
        console.log(`\nTotal Preps: ${preps.length}`);
        preps.forEach(p => {
            console.log(`Prep for Resume: ${p.resume}, Questions: ${p.questions?.length}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

debugData();
