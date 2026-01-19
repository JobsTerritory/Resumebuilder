const jwt = require('jsonwebtoken');
const storage = require('../config/storage');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            const user = await storage.findUserById(decoded.id);

            if (!user) {
                res.status(401).json({ message: 'User not found' });
                return;
            }

            req.user = user;

            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                console.log(`Auth failed: ${error.message}`);
            } else {
                console.log(error);
            }
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
