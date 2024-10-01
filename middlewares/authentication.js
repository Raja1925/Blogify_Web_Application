// const jwt = require('jsonwebtoken');

// function checkForAuthenticationCookie(cookieName) {
//     return (req, res, next) => {
//         const tokenCookieValue = req.cookies[cookieName]
//         if(!tokenCookieValue) {
//            return next();
//         }

//         try {
//             const userPayload = validateToken(tokenCookieValue);
//             req.user = userPayload;
//         } catch(error) {}

//         return next();
//     };
// }

// module.exports = {
//     checkForAuthenticationCookie,
// }

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateToken } = require('../services/auth'); // Adjust the path as necessary

// Use environment variable for the secret key
const secretKey = process.env.JWT_SECRET || '!ronMan@123'; // Replace with your actual secret

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];

        if (!tokenCookieValue) {
            return next(); // No token, proceed to the next middleware
        }

        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload; // Attach user info to request
        } catch (error) {
            console.error('Token validation error:', error); // Log error for debugging
            req.user = null; // Optionally set req.user to null if token validation fails
        }

        return next(); // Proceed to the next middleware
    };
}

const authenticate = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, secretKey); // Use the defined secret key
        req.user = await User.findById(decoded._id); // Ensure you're accessing the correct property
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = {
    checkForAuthenticationCookie,
    authenticate,
};
