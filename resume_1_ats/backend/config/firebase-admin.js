const admin = require('firebase-admin');

// Initialize Firebase Admin SDK only if credentials are configured
// This allows the backend to run without Firebase for email/password auth
let firebaseInitialized = false;

try {
    // Check if Firebase credentials are configured
    const projectId = process.env.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID';

    if (projectId !== 'YOUR_PROJECT_ID' && process.env.FIREBASE_PRIVATE_KEY) {
        // Use environment variables (recommended for production)
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: process.env.FIREBASE_CERT_URL
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        firebaseInitialized = true;
        console.log('✓ Firebase Admin SDK initialized successfully');
    } else {
        console.log('⚠ Firebase Admin SDK not configured - Phone OTP authentication disabled');
        console.log('  Email/Password authentication will work normally');
        console.log('  To enable Phone OTP, configure Firebase credentials in .env file');
    }
} catch (error) {
    console.error('⚠ Firebase Admin SDK initialization failed:', error.message);
    console.log('  Email/Password authentication will work normally');
    console.log('  Phone OTP authentication is disabled');
}

// Export admin and initialization status
module.exports = {
    admin,
    firebaseInitialized
};
