const storage = require('./config/storage');
const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // We assume we are checking for the user from the previous turn (I can't know the exact user ID easily without logging in)
        // detailed query
        const InterviewPrep = require('./models/InterviewPrep');
        const preps = await InterviewPrep.find({});
        console.log(`Found ${preps.length} interview prep records.`);
        if (preps.length > 0) {
            console.log('Sample Prep:', JSON.stringify(preps[0], null, 2));
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
