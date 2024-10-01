const jwt = require('jsonwebtoken');

const secretKey = '!ronMan@123';

function createTokenForUser(user) {
    const payload = {
        _id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
        name: user.fullName, // Add the user's name or full name
    };
    
    // Optionally add an expiration
    const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
    return token;
}

function validateToken(token) {
    try {
        const payload = jwt.verify(token, secretKey);
        return payload;
    } catch (error) {
        // Handle token validation errors (optional)
        throw new Error('Invalid token');
    }
}

module.exports = {
    createTokenForUser,
    validateToken,
};
