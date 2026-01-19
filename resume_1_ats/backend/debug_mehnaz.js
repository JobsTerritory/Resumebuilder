const mongoose = require('mongoose');
require('dotenv').config();
const Resume = require('./models/Resume');
const InterviewPrep = require('./models/InterviewPrep');

const debugData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const resume = await Resume.findOne({ title: /MEHNAZ/i });
        if (resume) {
            console.log('--- FOUND RESUME ---');
            console.log('ID:', resume._id.toString());
            console.log('User:', resume.user);
            console.log('Title:', resume.title);

            const prep = await InterviewPrep.findOne({ resume: resume._id.toString() }); // Check string match
            const prepObj = await InterviewPrep.findOne({ resume: resume._id }); // Check ObjectId match

            console.log('--- CHECKING PREP ---');
            console.log('Prep (String ID match):', prep ? 'FOUND' : 'NOT FOUND');
            console.log('Prep (ObjectId match):', prepObj ? 'FOUND' : 'NOT FOUND');

            if (prep) console.log('Questions count:', prep.questions.length);
        } else {
            console.log('Resume "MEHNAZ" not found.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

debugData();
